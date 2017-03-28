
var Url = require("url");
var Ws = require("ws");

module.exports = function (hijacksocket) {
  return function (host, ws1) {
    if (!hijacksocket(ws1)) {
      var messages = [];
      ws1.on("message", function (message) { messages.push(message) });
      var ws2 = new Ws("wss"+"://"+host+ws1.upgradeReq.url).on("open", function () {
        ws1.removeAllListeners("message");
        messages.forEach(function (message) { ws2.send(message.data, message.flags) });
        messages = null;
        ws2.on("close", function (code, reason) { ws1.close(code, reason) });
        ws1.on("close", function (code, reason) { ws2.close(code, reason) });
        ws2.on("message", function (message) { ws1.send(message.data, message.flags) });
        ws1.on("message", function (message) { ws2.send(message.data, message.flags) });
      });
    }
  };
};
