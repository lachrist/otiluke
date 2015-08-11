
var Url = require("url");
var Js = require("./js.js");
var Html = require("./html2.js");
var Iconv = require("iconv-lite");

// req --> proxy --> req2 --> server
// res <-- proxy <-- res2 <-- server

module.exports = function (log, nsp, ini) {
  var js = Js(nsp, ini);
  var html = Html(log, js.internal);
  return function (protocol, req, res) {
    var ishtml = req.headers["accept"].indexOf("text/html") !== -1;
    var isjs = req.headers["accept"].indexOf("application/javascript") !== -1;
    if (ishtml || isjs)
      delete req.headers["accept-encoding"];
    var parts = Url.parse(req.url);
    parts.method = req.method;
    parts.headers = req.headers;
    parts.rejectUnauthorized = false;
    log.info("forward: ", parts, "\n\n");
    var req2 = protocol.request(parts, function (res2) {
      if (Number(res2.statusCode) >= 300)
        log.warning(res2.statusCode, " ", res2.statusMessage, " ", parts, "\n\n");
      if (ishtml || isjs)
        delete res2.headers["content-length"];
      res.writeHead(res2.statusCode, res2.statusMessage, res2.headers);
      if (ishtml)
        return html(encoding(res2), res2, res);
      if (isjs)
        return js.external(encoding(res2), res2, res, req.url);
      res2.pipe(res);
    });
    req2.on("error", function (err) { log.error("forward ", err.message, " ", parts, "\n\n") });
    req.pipe(req2);
  };
}

function encoding (res) {
  var type = res.headers["content-type"];
  var parts = /(?:charset|encoding)\s*=\s*['"]? *([\w\-]+)/i.exec(type);
  if (!parts || !Iconv.encodingExists(parts[1]))
    return "ISO-8859-1";
  return parts[1];
}
