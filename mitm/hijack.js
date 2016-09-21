
var Url = require("url");
var Ws = require("ws");
var Signal = require("../util/signal.js")

module.exports = function (log, splitter) {
  return function (host, server) {
    Ws.Server({server:server}).on("connection", function (ws1) {
      var parts = Url.parse(ws1.upgradeReq.url);
      if (parts.pathname.substring(1) === splitter)
        return ws1.on("message", log(decodeURIComponent(parts.query)));
      var buffer = [];
      ws1.on("message", function (message) { buffer.push(message) });
      var ws2 = new Ws("wss"+"://"+host+ws1.upgradeReq.url).on("open", function () {
        ws1.removeAllListeners("message");
        buffer.forEach(function (message) { ws2.send(message) });
        buffer = null;
        ws2.on("close", function (code, message) { ws1.close(code, message) });
        ws1.on("close", function (code, message) { ws2.close(code, message) });
        ws2.on("message", function (message) { ws1.send(message) });
        ws1.on("message", function (message) { ws2.send(message) });
      });
      ws2.on("error", Signal(__filename+"-ws2-"+host));
    });
  };
};
