
var ChannelMock = require("channel-uniform/mock");

function load (module) {
  if (!module)
    return function () {}
  if (typeof module === "function")
    return module;
  if (typeof module === "string")
    return require(module);
  return require(module.path)(module.argument);
}

module.exports = function (options, callback) {
  var virus = load(options.virus);
  var onrequest = load(options.onrequest);
  var onconnect = load(options.onconnect);
  var channel = ChannelMock({
    onrequest: function (req, res) {
      if (!onrequest(req, res)) {
        res.writeHead(400, "request-not-handled");
        res.end();
      }
    },
    onconnect: function (con) {
      if (!onconnect(con)) {
        con.close(4000, "connect-not-handled");
      }
    }
  });
  virus({
    static: 
    connect: channel.connect,
    request: channel.request
  }, callback);
};
