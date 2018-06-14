
const Net = require("net");

module.exports = ({server, socket:socket1, head, emitter}) => {
  const socket2 = new Net.Socket();
  socket2.on("error", (error) => {
    error.message += " [tunnel "+server.address()+"]";
    emitter.emit("error", error);
  });
  socket2.on("connect", () => {
    socket1.write("HTTP/1.1 200 Connection Established\r\n\r\n");
    socket2.write(head);
    socket1.pipe(socket2);
    socket2.pipe(socket1);
  });
  socket2.connect(server.address());
};
