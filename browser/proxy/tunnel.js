
const Net = require("net");
const OnError = require("./on-error.js");

module.exports = ({server, socket:socket1, head, emitter}) => {
  const socket2 = new Net.Socket();
  socket2.on("error", OnError("tunnel-socket", emitter));
  socket2.on("connect", () => {
    socket1.write("HTTP/1.1 200 Connection Established\r\n\r\n");
    socket2.write(head);
    socket1.pipe(socket2);
    socket2.pipe(socket1);
  });
  socket2.connect(server.address());
};
