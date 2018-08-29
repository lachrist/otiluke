
const Os = require("os");
const Path = require("path");
const Net = require("net");
const Infect = require("./infect.js");
const Forward = require("./forward.js");
const Extract = require("./extract.js");
const Forge = require("./forge.js");

const noop = () => {};

module.exports = (vpath, options) => {
  options = Object.assign({
    "handlers": Object.create(null),
    "ca-home": Path.join(__dirname, "ca-home"),
    "ipc-dir": Os.platform() === "win32" ? "\\\\?\\pipe" : "/tmp",
    "virus-var": "__OTILUKE__",
    "argm-prefix": "otiluke-"
  }, options);
  options.handlers.activity = options.handlers.activity || noop;
  options.handlers.forgery = options.handlers.forgery || noop;
  options.handlers.request = options.handlers.request || noop;
  options.handlers.connect = options.handlers.connect || noop;
  options.handlers.upgrade = options.handlers.upgrade || noop;
  const infect = Infect(vpath, options["virus-var"], options["argm-prefix"]);
  const forward = Forward(options["handlers"], infect);
  const forge = Forge(options["ipc-dir"], options["ca-home"]);
  return {
    request: forward.request,
    upgrade: forward.upgrade,
    connect: function (request, socket, head) {
      options.handlers.activity("server-connect-request", this, request);
      options.handlers.activity("server-connect-socket", this, socket);
      const {hostname, port} = Extract(request);
      forge(hostname, port, (error, server) => {
        if (error) {
          socket.write("HTTP/1.1 500 [Otiluke] Forge failure\r\n\r\n");
          socket.destroy(error);
        } else {
          if (!("_otiluke_marker" in server)) {
            server._otiluke_marker = null;
            options.handlers.forgery(hostname, server);
            server.on("request", forward.request);
            server.on("upgrade", forward.upgrade);
            server.on("connect", forward.connect);
          }
          const client_socket = new Net.Socket();
          options.handlers.activity("client-connect-socket", this, client_socket);
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
