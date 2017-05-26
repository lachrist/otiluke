
var Sphere = require(TEMPLATE.sphere.path);
var Hijack = require(TEMPLATE.hijack.path);
var ChannelMock = require("channel-uniform/mock");

global.Otiluke = function (callback) {
  var hijack = Hijack(TEMPLATE.hijack.argument);
  Sphere(TEMPLATE.sphere.argument, ChannelMock({
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
