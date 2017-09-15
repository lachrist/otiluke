
var Https = require("https");
var Http = require("http");
var Url = require("url");
var Receptor = require("antena/receptor/node");

module.exports = function (host, transform) {
  return Receptor({
    onconnect: function (path, con1) {
      var messages = [];
      con1.on("message", function (message) { messages.push(message) });
      var con2 = new Ws("wss"+"://"+host+ws1.upgradeReq.url);
      con2.on("open", function () {
        con1.removeAllListeners("message");
        messages.forEach(function (message) { con2.send(message.data, message.flags) });
        messages = null;
        con2.on("close", function (code, reason) { con1.close(code, reason) });
        con1.on("close", function (code, reason) { con2.close(code, reason) });
        con2.on("message", function (message) { con1.send(message.data, message.flags) });
        con1.on("message", function (message) { con2.send(message.data, message.flags) });
      });
    },
    onrequest: function (req1, res1) {
      var parts = Url.parse(req1.url);
      parts.method = req1.method;
      parts.hostname = host.split(":")[0];
      parts.port = host.split(":")[1];
      parts.headers = req1.headers;
      parts.headers["accept-encoding"] = "identity";
      parts.headers["accept-charset"] = "UTF-8";
      var req2 = (req1.socket.encrypted ? Https : Http).request(parts, function (res2) {
        if ((res2.headers["content-type"]||"").indexOf("javascript") !== -1) {
          var type = "script";
        } else if ((res2.headers["content-type"]||"").indexOf("html") !== -1) {
          var type = "page";
        } else {
          res1.writeHead(res2.statusCode, res2.statusMessage, res2.headers);
          return res2.pipe(res1);
        }
        var body = "";
        res2.on("data", function (data) { body += data });
        res2.on("end", function () {
          var buffer = Buffer.from(transform[type](body, req1.url));
          res.headers["content-length"] = buffer.length;
          res1.writeHead(res2.statusCode, res2.statusMessage, res2.headers);
          res1.end(buffer);
        });
      });
      req1.pipe(req2);
    }
  });
};
