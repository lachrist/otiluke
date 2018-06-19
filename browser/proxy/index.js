
const Http = require("http");
const Os = require("os");
const Events = require("events");
const Path = require("path");
const Mock = require("./mock.js");
const Tunnel = require("./tunnel.js");
const Infect = require("./infect.js");
const Forward = require("./forward.js");
const OnError = require("./on-error.js");

module.exports = (vpath, options) => {
  const emitter = new Events();
  options = options || {};
  options["server-namespace"] = options["server-namespace"] || Path.join(
      Os.platform() === "win32" ? "\\\\?\\pipe" : "/tmp",
      "otiluke-"+(new Date().getTime()).toString(36)+"-"+Math.random().toString(36).substring(2,10));
  options["http-splitter"] = options["http-splitter"] || "otiluke-"+Math.random().toString(36).substring(2);
  options["ca"] = options["ca"] || Path.join(__dirname, "..", "ca");
  options.heartbeat = options.heartbeat || 120 * 1000;
  const infect = Infect(vpath, {
    "url-search-prefix": options["url-search-prefix"] || "otiluke-",
    "global-variable": options["global-variable"] || "otiluke_"+Math.random().toString(36).substring(2),
    "http-splitter": options["http-splitter"]
  });
  const servers = {};
  const proxy = Http.createServer();
  proxy.on("connect", (request, socket, head) => {
    request.on("error", OnError("connect-request", emitter));
    socket.on("error", OnError("connect-socket", emitter));
    if (request.url in servers) {
      if (Array.isArray(servers[request.url])) {
        servers[request.url].push([socket, head]);
      } else {
        Tunnel({server:servers[request.url], socket:socket, head:head, emitter:emitter});
      }
    } else {
      servers[request.url] = [[socket, head]];
      Mock(request.url, options["ca"], (error, server) => {
        if (error) {
          OnError("mock-creation", emitter).call(request, error);
        } else {
          const forward = Forward(infect, {
            host: request.url,
            splitter: options["http-splitter"],
            emitter: emitter
          });
          server.on("error", OnError("mock-server", emitter));
          server.on("connect", forward.connect);
          server.on("upgrade", forward.upgrade);
          server.on("request", forward.request);
          const heart = () => {
            server.getConnections(beat);
          };
          const beat = (error, connections) => {
            if (error) {
              OnError("mock-server-hearbeat", emitter).call(server, error);
            } else if (connections === 0) {
              server.close();
              delete servers[request.url];
            } else {
              setTimeout(heart, options["heartbeat"]);
            }
          }
          setTimeout(heart, options["heartbeat"]);
          server.listen(options["server-namespace"]+"_"+request.url, () => {
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
    Forward(infect, {
      host: url.host,
      splitter: options["http-splitter"],
      emitter: emitter
    }).request(request, response);
  });
  proxy.on("error", OnError("mitm-proxy", emitter));
  proxy.on("close", (haderror) => {
    emitter.emit("close", haderror);
  });
  proxy.on("listening", () => {
    emitter.emit("listening");
  });
  emitter.close = (callback) => {
    proxy.close(callback);
    proxy.removeAllListeners("connect");
    Object.keys(servers).forEach((host) => {
      if (!Array.isArray(servers[host])) {
        servers[host].close();
      }
      delete servers[host];
    });
  };
  emitter.listen = proxy.listen.bind(proxy);
  emitter.address = proxy.address.bind(proxy);
  return emitter;
};
