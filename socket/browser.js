
module.exports = function (splitter) {
  var socket = new WebSocket("ws"+location.protocol.substring(4)+"//"+location.host+"/"+splitter);
  socket.onmessage = function (event) { interface.onmessage(event.data) };
  socket.onclose = function (event) { interface.onclose(event) };
  socket.onerror = function (event) { interface.onerror(event) };
  socket.onopen = function () {
    interface.send = function (data) { socket.send(data) };
    buffer.forEach(interface.send);
    buffer = null;
  };
  var buffer = [];
  var interface = {
    send: function (data) { buffer.push(data) },
    close: function () { socket.close() },
    onclose: function () {},
    onerror: function () {},
    onmessage: function () {},
  };
  return interface;
};
