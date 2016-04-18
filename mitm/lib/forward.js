
var Log = require("../log.js");
var Url = require("url");

// var Iconv = require("iconv-lite");
// var charset = /(?:charset|encoding)\s*=\s*['"]? *([\w\-]+)/i;

module.exports = function (intercept, protocol, parts, req1, res1) {
  parts.headers["accept-encoding"] = "identity";
  parts.headers["accept-charset"] = "UTF-8";
  var req2 = protocol.request(parts, function (res2) {
    var transform = intercept(Url.format(parts), res2.headers["content-type"] || "");
    if (transform)
      delete res2.headers["content-length"];
    res2.headers["Access-Control-Allow-Origin"] = "*";
    res2.headers["Access-Control-Allow-Credentials"] = true;
    res2.headers["Access-Control-Allow-Methods"] = "*";
    res1.writeHead(res2.statusCode, res2.statusMessage, res2.headers);
    if (!transform)
      return res2.pipe(res1);
    var buffer = [];
    res2.setEncoding("utf8");
    res2.on("data", buffer.push.bind(buffer));
    res2.on("end", function () { res1.end(transform(buffer.join("")), "utf8") });
  })
  req2.on("error", Log(parts.hostname + " " + parts.port));
  req1.pipe(req2);
};
