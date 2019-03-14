
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
  options = Object.assign({__proto__:null}, options);
  options.cahome = options.cahome || Path.join(__dirname, "..", "ca");
  options.sockdir = options.sockdir || (Os.platform() === "win32" ? "\\\\?\\pipe" : Os.tmpdir());
  options.gvar = options.gvar || "__OTILUKE__";
  options.argmpfx = options.argmpfx || "otiluke-";
  options.agents = options.agents || {__proto__:null};
  options.agents.http = options.agents.http || new Http.Agent({keepAlive:true});
  options.agents.https = options.agents.https || new Https.Agent({keepAlive:true});
  options.intercept = options.intercept || {__proto__:null};
  options.intercept.request = options.intercept.request || noop;
  options.intercept.connect = options.intercept.connect || noop;
  options.intercept.upgrade = options.intercept.upgrade || noop;
  options.register = options.register || {__proto__:null};
  options.register.request = options.register.request || noop;
  options.register.connect = options.register.connect || noop;
  options.register.upgrade = options.register.upgrade || noop;
  options.register.forgery = options.register.forgery || noop;
  const infect = Infect(vpath, options.gvar, options.argmpfx);
  const forge = Forge(options.agents.http, options.sockdir, options.cahome);
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
