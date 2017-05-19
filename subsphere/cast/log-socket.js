
module.exports = function (LogSphere) {
  return function (splitter, client) {
    function send (message) {
      client.request("POST", "/"+splitter, {}, message, true);
    }
    var mock;
    function open () {
      mock = {send:send};
      var ws = client.websocket("/"+splitter);
      ws.onopen = function () { mock = ws }
      ws.onclose = open;
    }
    open();
    return LogSphere(function (data) { mock.send(data) });
  }
};
