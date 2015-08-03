
var Url = require("url");
var Html = require("./html.js");

// req --> proxy --> req2 --> server
// res <-- proxy <-- res2 <-- server

module.exports = function (log, nsp, ini) {
  var html = Html(log, nsp, ini);
  return function (protocol, req, res) {
    delete req.headers["accept-encoding"];
    var parts = Url.parse(req.url);
    parts.method = req.method;
    parts.headers = req.headers;
    parts.rejectUnauthorized = false;
    log.info("forward: ", parts, "\n\n");
    var req2 = protocol.request(parts, function (res2) {
      if (res2.statusCode !== 200)
        log.warning(res2.statusCode, " ", res2.statusMessage, " ", parts, "\n\n");
      var type = res2.headers["content-type"];
      var ishtml = type && type.indexOf("text/html") !== -1;
      if (ishtml)
        delete res2.headers["content-length"];
      res.writeHead(res2.statusCode, res2.statusMessage, res2.headers);
      if (ishtml)
        return html(charset(type), res2, res)
      res2.pipe(res);
    });
    req2.on("error", function (err) { log.error("forward ", err.message, " ", parts, "\n\n") });
    req.pipe(req2);
  };
}

function charset (type) {
  var parts = /(?:charset|encoding)\s*=\s*['"]? *([\w\-]+)/i.exec(type);
  return parts && parts[1];
}