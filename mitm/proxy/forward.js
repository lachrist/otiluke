
var Error = require("../../util/error.js");
var Url = require("url");
var Http = require("http");
var Https = require("https");

module.exports = function (intercept, host) {
  var hostname = host.split(":")[0];
  var port = host.split(":")[1];
  return function (req1, res1) {
    var parts = Url.parse(req1.url);
    parts.method = req1.method;
    parts.hostname = hostname;
    parts.port = port;
    parts.headers = req1.headers;
    parts.headers["accept-encoding"] = "identity";
    parts.headers["accept-charset"] = "UTF-8";
    var req2 = (req1.socket.encrypted ? Https : Http).request(parts, function (res2) {
      var transform = intercept(Url.format(parts), res2.headers["content-type"] || "");
      if (transform)
        delete res2.headers["content-length"];
      res1.writeHead(res2.statusCode, res2.statusMessage, res2.headers);
      if (!transform)
        return res2.pipe(res1);
      var buffer = [];
      res2.setEncoding("utf8");
      res2.on("data", function (data) { buffer.push(data) });
      res2.on("end", function () { res1.end(transform(buffer.join("")), "utf8") });
    })
    req2.on("error", Error(__filename+"-req2-"+host));
    req1.pipe(req2);
  };
};
