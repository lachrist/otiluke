
const Net = require("net");
const Tls = require("tls");

module.exports = (event, {host, hostname, port, prefix, emitter}) => (request, socket1, head) => {
  console.log("AOSKASOKASDOADSK");
  if (request.url.startsWith(prefix)) {
    request.url = request.url.substring(prefix.length);
    emitter.emit(event, request, socket1, head);
  } else {
    const socket = new (request.socket.encrypted ? Net : Tls).Socket();
    socket.on("error", (error) => {
      error.message += " [forward-socket "+host+"]";
      emitter.emit("error", error);
    });
    socket.on("connect", () => {
      socket2.write(request.method+" "+request.url+" HTTP/"+request.httpVersion+"\r\n");
      for (let index = 0, length = request.rawHeaders.length; index < length; index+=2)
        socket2.write(request.rawHeaders[index]+": "+rawHeaders.rawHeaders[index+1]+"\r\n");
      socket2.write("\r\n");
      socket2.write(head1);
      socket1.pipe(socket2);
      socket2.pipe(socket1);
    });
    socket.connect(port, hostname);
  }
};
