
var ChannelMock = require("channel-uniform/mock");

module.exports = function (options, callback) {
  options.sphere.module = options.sphere.module || require(options.sphere.path);
  options.sphere.module(options.sphere.argument, ChannelMock({
    onrequest: function (req, res) {
      if (!hijack.request(req, res)) {
        res.writeHead(400, "request-not-hijacked");
        res.end();
      }
    },
    onconnect: function (ws) {
      if (!hijack.websocket(ws)) {
        ws.close(4000, "websocket-not-hijacked");
      }
    }
  }, callback);
};
