
const Os = require("os");
const Path = require("path");
const Net = require("net");
const Infect = require("./infect.js");
const Forward = require("./forward.js");
const Extract = require("./extract.js");
const Forge = require("./forge.js");

const noop = () => {};

module.exports = (vpath, options = {}) => {
  const options_ca_home = options["ca-home"] || Path.join(__dirname, "..", "ca");
  const options_socket_dir = options["socket-dir"] || (Os.platform() === "win32" ? "\\\\?\\pipe" : Os.tmpdir());
  const options_global_var = options["global-var"] || "__OTILUKE__";
  const options_argm_prefix = options["argm-prefix"] || "otiluke-";
  const options_handlers = options["handlers"] || {};
  options_handlers.activity = options_handlers.activity || noop;
  options_handlers.forgery = options_handlers.forgery || noop;
  options_handlers.request = options_handlers.request || noop;
  options_handlers.connect = options_handlers.connect || noop;
  options_handlers.upgrade = options_handlers.upgrade || noop;
  const infect = Infect(vpath, options_global_var, options_argm_prefix);
  const forward = Forward(options_handlers, infect);
  const forge = Forge(options_socket_dir, options_ca_home);
  return {
    request: forward.request,
    upgrade: forward.upgrade,
    connect: function (request, socket, head) {
      options_handlers.activity("server-connect-request", this, request);
      options_handlers.activity("server-connect-socket", this, socket);
      const {hostname, port} = Extract(request);
      forge(hostname, port, (error, server) => {
        if (error) {
          socket.write("HTTP/1.1 500 [Otiluke] Forge failure\r\n\r\n");
          socket.destroy(error);
        } else {
          if (!("_otiluke_marker" in server)) {
            server._otiluke_marker = null;
            options_handlers.forgery(hostname, server);
            server.on("request", forward.request);
            server.on("upgrade", forward.upgrade);
            server.on("connect", forward.connect);
          }
          const client_socket = new Net.Socket();
          options_handlers.activity("client-connect-socket", this, client_socket);
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
