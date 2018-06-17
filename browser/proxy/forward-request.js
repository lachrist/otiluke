
const Https = require("https");
const Http = require("http");
const Url = require("url");
const OnError = require("./on-error.js");

module.exports = (infect, {host, hostname, port, prefix, emitter}) => (request1, response1) => {
  if (request1.url.startsWith(prefix)) {
    request1.url = request1.url.substring(prefix.length);
    request1.url = request1.url || "/";
    emitter.emit("request", request1, response1);
  } else {
    request1.on("error", OnError("mock-request", emitter));
    response1.on("error", OnError("mock-response", emitter));
    request1.headers["accept-encoding"] = "identity";
    request1.headers["accept-charset"] = "UTF-8";
    const request2 = (request1.socket.encrypted ? Https : Http).request({
      hostname: hostname,
      port: port,
      method: request1.method,
      path: request1.url,
      headers: request1.headers
    });
    request2.on("error", OnError("forward-request", emitter));
    request2.on("response", (response2) => {
      response2.on("error", OnError("forward-response", emitter));
      const closure = "content-type" in response2.headers && infect(response2.headers["content-type"]);
      if (!closure) {
        response1.writeHead(response2.statusCode, response2.statusMessage, response2.headers);
        response2.pipe(response1);
      } else {
        let length = 0;
        let buffers = [];
        response2.on("data", (buffer) => {
          buffers.push(buffer);
          length += buffer.length;
        });
        response2.on("end", () => {
          const buffer = Buffer.from(closure(Buffer.concat(buffers, length).toString("utf8"), new URL("http://"+hostname+":"+port+request1.url)), "utf8");
          response2.headers["content-length"] = buffer.length;
          response1.writeHead(response2.statusCode, response2.statusMessage, response2.headers);
          response1.end(buffer);
        });
      }
    })
    request1.pipe(request2);
  }
};