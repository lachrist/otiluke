
const Http = require("http");
const Os = require("os");
const Events = require("events");
const Path = require("path");
const Mock = require("./mock.js");
const Tunnel = require("./tunnel.js");
const Intercept = require("./intercept.js");
const Forward = require("./forward.js");

module.exports = (options) => {
  const emitter = new Events();
  options = Object.assign({
    "socket-address-prefix": Path.join(
      Os.platform() === "win32" ? "\\\\?\\pipe" : "/tmp",
      "otiluke-"+(new Date().getTime()).toString(36)+"-"+Math.random().toString(36).substring(2,10)),
    "transform-variable": "otiluke_"+Math.random().toString(36).substring(2),
    "http-splitter": "otiluke-"+Math.random().toString(36).substring(2),
    "url-search-key": "otiluke",
    "ca": Path.join(__dirname, "..", "ca")
  }, options);
  const intercept = Intercept(emitter, options);
  const servers = {};
  const onerror = function (error) {
    error.message += " [mock-server "+this.address()+"]";
    emitter.emit("error", error);
  };
  const proxy = Http.createServer();
  proxy.on("connect", (request, socket, head) => {
    if (request.url in servers) {
      if (Array.isArray(servers[request.url])) {
        servers[request.url].push([socket, head]);
      } else {
        Tunnel({server:servers[request.url], socket:socket, head:head, emitter:emitter});
      }
    } else {
      servers[request.url] = [[socket, head]];
      Mock(request.url, options.ca, (error, server) => {
        if (error) {
          error.message += " [could not create server mocking "+request.url+"]";
          emitter.emit("error", error);
        } else {
          const forward = Forward(intercept, {
            host: request.url,
            splitter: options["http-splitter"],
            emitter: emitter
          });
          server.on("error", onerror);
          server.on("connect", forward.connect);
          server.on("upgrade", forward.upgrade);
          server.on("request", forward.request);
          const heart = () => {
            server.getConnections(beat);
          };
          const beat = (error, connections) => {
            if (error || !connections) {
              server.close();
              delete servers[request.url];
            } else {
              setTimeout(heart, 12000);
            }
          }
          setTimeout(heart, 120000);
          server.listen(options["socket-address-prefix"]+"_"+request.url, () => {
            servers[request.url].forEach((pair) => {
              Tunnel({server:server, socket:pair[0], head:pair[1], emitter:emitter});
            });
            servers[request.url] = server;
          });
        };
      })
    }
  });
  proxy.on("request", (request, response) => {
    // https://www.w3.org/Protocols/HTTP/1.1/rfc2616bis/draft-lafon-rfc2616bis-03.html#rfc.section.5.1.2
    const url = new URL(request.url);
    request.url = url.pathname + url.search + url.hash;
    Forward(intercept, {
      host: url.host,
      splitter: options["http-splitter"],
      emitter: emitter
    }).request(request, response);
  });
  proxy.on("error", (error) => {
    error.message += " [mitm proxy]";
    emitter.emit("error", error);
  });
  proxy.on("close", (haderror) => {
    Object.keys(servers).forEach((host) => {
      if (!Array.isArray(servers[host])) {
        servers[host].close();
      }
    });
    servers = [];
    emitter.emit("close", haderror);
  });
  proxy.on("listening", () => {
    emitter.emit("listening");
  });
  emitter.listen = proxy.listen.bind(proxy);
  emitter.close = proxy.close.bind(proxy);
  emitter.address = proxy.address.bind(proxy);
  return emitter;
};
