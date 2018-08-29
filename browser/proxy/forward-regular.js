
const Https = require("https");
const Http = require("http");
const Extract = require("./extract.js");

function ondata (string) {
  this._otiluke_body += string;
}

function onend () {
  const buffer = Buffer.from(this._otiluke_transform(this._otiluke_body, this._otiluke_source), "utf8");
  this.headers["content-length"] = buffer.length;
  this._otiluke_response.writeHead(this.statusCode, this.statusMessage, this.headers);
  this._otiluke_response.end(buffer);
}

module.exports = (infect, handlers) => {
  function onresponse (client_response) {
    handlers.activity("client-regular-response", this._otiluke_origin, client_response);
    const transform = infect(client_response.headers["content-type"]);
    if (transform) {
      client_response._otiluke_transform = transform;
      client_response._otiluke_body = "";
      client_response._otiluke_source = "http://"+this.getHeader("host")+this.path;
      client_response._otiluke_response = this._otiluke_response;
      client_response.setEncoding("utf8");
      client_response.on("data", ondata);
      client_response.on("end", onend);
    } else {
      this._otiluke_response.writeHead(client_response.statusCode, client_response.statusMessage, client_response.headers);
      client_response.pipe(this._otiluke_response);  
    }
  };
  return function (request, response) {
    handlers.activity("server-regular-request", this, request);
    handlers.activity("server-regular-response", this, response);
    if (!handlers.request(request, response)) {
      request.headers["accept-encoding"] = "identity";
      request.headers["accept-charset"] = "UTF-8";
      const client_request = (request.socket.encrypted ? Https : Http).request(Extract(request));
      handlers.activity("client-regular-request", this, client_request);
      client_request._otiluke_response = response;
      client_request._otiluke_origin = this;
      client_request.on("response", onresponse);
      request.pipe(client_request);
    }
  };
};
