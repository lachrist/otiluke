
var Https = require("https");
var Http = require("http");
var Url = require("url");

module.exports = (intercept, {host, hostname, port, prefix, emitter}) => {
  const onrequest1error = (error) => {
    error.message += "[mock-request "+host+"]";
    emitter.emit("error", error);
  };
  const onresponse1error = (error) => {
    error.message += "[mock-response "+host+"]";
    emitter.emit("error", error);
  };
  const onrequest2error = (error) => {
    error.message += "[forward-request "+host+"]";
    emitter.emit("error", error);
  };
  const onresponse2error = (error) => {
    error.message += "[forward-response "+host+"]";
    emitter.emit("error", error);
  };
  return (request1, response1) => {
    if (request1.url.startsWith(prefix)) {
      request1.url = request1.url.substring(prefix.length);
      request1.url = request1.url || "/";
      emitter.emit("request", request1, response1);
    } else {
      request1.on("error", onrequest1error);
      response1.on("error", onresponse1error);
      request1.headers["accept-encoding"] = "identity";
      request1.headers["accept-charset"] = "UTF-8";
      const source = {
        hostname: hostname,
        port: port,
        method: request1.method,
        path: request1.url,
        headers: request1.headers
      };
      const request2 = (request1.socket.encrypted ? Https : Http).request(source);
      request2.on("error", onrequest2error);
      request2.on("response", (response2) => {
        response2.on("error", onresponse2error);
        const closure = "content-type" in response2.headers && intercept(response2.headers["content-type"]);
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
            const buffer = Buffer.from(closure(Buffer.concat(buffers, length).toString("utf8"), source), "utf8");
            response2.headers["content-length"] = buffer.length;
            response1.writeHead(response2.statusCode, response2.statusMessage, response2.headers);
            response1.end(buffer);
          });
        }
      })
      request1.pipe(request2);
    }
  };
};