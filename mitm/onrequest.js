
var Https = require("https");
var Http = require("http");

module.exports = function (hijackrequest, onhtml, onjs) {
  return function (host, req1, res1) {
    if (!hijackrequest(req1, res1)) {
      var parts = Url.parse(req1.url);
      parts.method = req1.method;
      parts.hostname = host.split(":")[0];
      parts.port = host.split(":")[1];
      parts.headers = req1.headers;
      parts.headers["accept-encoding"] = "identity";
      parts.headers["accept-charset"] = "UTF-8";
      var req2 = (req1.socket.encrypted ? Https : Http).request(parts, function (res2) {
        var isjs = res2.headers["content-type"].indexOf("javascript") !== -1;
        var ishtml = res2.headers["content-type"].indexOf("html") !== -1;
        if (isjs || ishtml)
          delete res2.headers["content-length"];
        res1.writeHead(res2.statusCode, res2.statusMessage, res2.headers);
        if (!isj && !ishmtl)
          return res2.pipe(res1);
        var buffers = [];
        res2.setEncoding("utf8");
        res2.on("data", function (buffer) { buffers.push(buffer) });
        res2.on("end", function () {
          res.end((isjs?onjs:onhtml)(Buffer.concat(buffers).toString("utf8")));
        });
      });
      req1.pipe(req2);
    }
  };
};
