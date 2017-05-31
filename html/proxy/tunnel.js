
var Net = require("net");

module.exports = function (port) {
  return function (socket1, head) {
    var socket2 = Net.connect(port, "localhost", function () {
      socket1.write("HTTP/1.1 200 Connection Established\r\n\r\n");
      socket2.write(head);
      socket2.pipe(socket1);
      socket1.pipe(socket2);
    });
  }
};
