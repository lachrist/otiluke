
const Os = require("os");
const Path = require("path");
const Net = require("net");
const Http = require("http");
const Https = require("https");
const Infect = require("./infect.js");
const Forward = require("./forward");
const Extract = require("./extract.js");
const Forge = require("./forge");

const noop = () => {};

module.exports = (vpath, options) => {
  options = Object.assign({
    "ca-home": Path.join(__dirname, "..", "ca"),
    "socket-dir": (Os.platform() === "win32" ? "\\\\?\\pipe" : Os.tmpdir()),
    "global-var": "__OTILUKE__",
    "argm-prefix": "otiluke-"
  }, options);
  options.agents = Object.assign({
    http: new Http.Agent({keepAlive:true}),
    https: new Https.Agent({keepAlive:true})
  }, options.agents);
  options.intercept = Object.assign({
    request: noop,
    connect: noop,
    upgrade: noop
  }, options.intercept);
  options.register = Object.assign({
    request: noop,
    connect: noop,
    upgrade: noop,
    forgery: noop
  }, options.register);
  const infect = Infect(vpath, options["global-var"], options["argm-prefix"]);
  const forge = Forge(options.agents.http, options["socket-dir"], options["ca-home"]);
  const forward = Forward(options.agents, infect, options.intercept, options.register);
  return {
    request: forward.request,
    upgrade: forward.upgrade,
    connect: function (request, socket, head) {
      const {hostname, port} = Extract(request);
      forge(hostname, port, (error, server) => {
        if (error) {
          socket.write("HTTP/1.1 500 [Otiluke] Forge failure\r\n\r\n");
          socket.destroy(error);
        } else {
          if (!("_otiluke_marker" in server)) {
            server._otiluke_marker = null;
            options.register.forgery.call(this, hostname, server);
            server.on("request", forward.request);
            server.on("upgrade", forward.upgrade);
            server.on("connect", forward.connect);
          }
          const client_socket = new Net.Socket();
          options.register.connect.call(this, client_socket);
          client_socket.connect(server.address(), () => {
            socket.write("HTTP/1.1 200 Connection Established\r\n\r\n");
            client_socket.write(head);
            socket.pipe(client_socket);
            client_socket.pipe(socket);
          });
        }
      });
    }
  };
};
