
var Net = require("net");
var Log = require("../log.js");

module.exports = function (port) {
  return function (socket1, head) {
    var socket2 = Net.connect(port, "localhost", function () {
      socket1.write("HTTP/1.1 200 Connection established\r\n\r\n");
      socket2.write(head);
      socket2.pipe(socket1);
      socket1.pipe(socket2);
    });
    socket2.on("error", Log(port));
  }
}
