
const ForwardSocket = require("./forward-socket.js");
const ForwardRequest = require("./forward-request.js");

module.exports = (intercept, options) => {
  options.prefix = "/"+options.splitter;
  options.hostname = options.host.split(":")[0];
  options.port = Number(options.host.split(":")[1]);
  return {
    connect: ForwardSocket("connect", options),
    upgrade: ForwardSocket("upgrade", options),
    request: ForwardRequest(intercept, options)
  };
};
