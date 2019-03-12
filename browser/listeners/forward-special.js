
const Net = require("net");
const Tls = require("tls");
const Extract = require("./extract.js");

function onconnect () {
  this.write(this._otiluke_request.method+" "+this._otiluke_request.url+" HTTP/"+this._otiluke_request.httpVersion+"\r\n");
  for (let index = 0, length = this._otiluke_request.rawHeaders.length; index < length; index+=2)
    this.write(this._otiluke_request.rawHeaders[index]+": "+this._otiluke_request.rawHeaders[index+1]+"\r\n");
  this.write("\r\n");
  this.write(this._otiluke_head);
  this._otiluke_socket.pipe(this);
  this.pipe(this._otiluke_socket);
};

module.exports = (event, handlers) => {
  const location = "forward-"+event;
  return function (request, socket, head) {
    if (!handlers[event](request, socket, head)) {
      let client_socket = new Net.Socket();
      if (request.socket.encrypted)
        client_socket = new Tls.TLSSocket(client_socket);
      handlers.activity(location, this, client_socket);
      client_socket._otiluke_request = request;
      client_socket._otiluke_socket = socket;
      client_socket._otiluke_head = head;
      const {hostname, port} = Extract(request);
      client_socket.connect(port, hostname, onconnect);
    }
  };
};
