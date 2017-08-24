
// var 
// var Transform = require(TRANSFORM_PATH);
// var Intercept = require(INTERCEPT_PATH);

var ChannelMock = require("channel-uniform/mock");
var Normalize = require("../common/normalize.js");

global.Otiluke = function (callback) {
  var hijack = Normalize.hijack(Hijack(TEMPLATE.hijack.argument));
  var sphere = Normalize.sphere(TEMPLATE.sphere);
  Sphere(sphere.argument, ChannelMock({
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
