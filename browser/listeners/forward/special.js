
const Net = require("net");
const Tls = require("tls");
const Extract = require("../extract.js");

function onclientconnect () {
  this.write(this._otiluke_request.method+" "+this._otiluke_request.url+" HTTP/"+this._otiluke_request.httpVersion+"\r\n");
  for (let index = 0, length = this._otiluke_request.rawHeaders.length; index < length; index+=2)
    this.write(this._otiluke_request.rawHeaders[index]+": "+this._otiluke_request.rawHeaders[index+1]+"\r\n");
  this.write("\r\n");
  this.write(this._otiluke_head);
  this._otiluke_socket.pipe(this);
  this.pipe(this._otiluke_socket);
};

function onclose (unclean) {
  if (unclean && !this._otiluke_socket.destroyed) {
    this._otiluke_socket.destroy(new Error("Error on associated socket"));
  }
}

module.exports = (intercept, register) => function (request, socket, head) {
  if (!intercept.call(this, request, socket, head)) {
    let client_socket = new Net.Socket();
    if (request.socket.encrypted)
      client_socket = new Tls.TLSSocket(client_socket);
    socket._otiluke_socket = client_socket;
    socket.on("close", onclose);
    register.call(this, client_socket);
    client_socket._otiluke_request = request;
    client_socket._otiluke_socket = socket;
    client_socket._otiluke_head = head;
    client_socket.on("close", onclose);
    client_socket.on("connect", onclientconnect);
    const {hostname, port} = Extract(request);
    client_socket.connect(port, hostname);
  }
};
