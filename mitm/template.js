
var NodeWebsocket = require("../util/node-websocket.js");
var Melf = require("melf/browser");

if (!this[SPLITTER]) {
  var dummy = [];
  dummy.send = function (data) { dummy[dummy.length] = data };
  (new WebSocket("wss://"+location.host+"/"+SPLITTER+"?"+encodeURIComponent(location.href))).onopen = function () {
    for (var i=0, l=dummy.length; i<l; i++)
      this.send(dummy[i]);
    dummy = this;
  }
  Object.defineProperty(global, SPLITTER, {
    value: TRANSPILE({
      socket: {
        send: function (data) { dummy.send(data) },
        on: function (event, data) {  }
      },function (data) { dummy.send(data) },
      melf: Melf(MELF);
    })
  });
}

(function (splitter) {
  if (splitter in this)
    return;

} (@SPLITTER));
