
const Net = require("net");
const Tls = require("tls");
const OnError = require("./on-error.js");

module.exports = (event, {host, hostname, port, prefix, emitter}) => (request, socket, head) => {
  request.on("error", OnError(event+"-mock-request", emitter));
  socket.on("error", OnError(event+"-mock-socket", emitter));
  if (request.url.startsWith(prefix)) {
    request.url = request.url.substring(prefix.length);
    emitter.emit(event, request, socket, head);
  } else {
    const forward_socket = new (request.socket.encrypted ? Net : Tls).Socket();
    forward_socket.on("error", OnError(event+"-forward-socket"));
    forward_socket.on("connect", () => {
      forward_socket.write(request.method+" "+request.url+" HTTP/"+request.httpVersion+"\r\n");
      for (let index = 0, length = request.rawHeaders.length; index < length; index+=2)
        forward_socket.write(request.rawHeaders[index]+": "+rawHeaders.rawHeaders[index+1]+"\r\n");
      forward_socket.write("\r\n");
      forward_socket.write(head1);
      socket.pipe(forward_socket);
      forward_socket.pipe(socket);
    });
    forward_socket.connect(port, hostname);
  }
};