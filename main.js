
var fs = require("fs");
var url = require("url");
var http = require("http");
var https = require("https");
var Page = require("./page.js")
var template = fs.readFileSync(__dirname+"/template.js", {encoding:"utf8"});

module.exports = function (namespace, initialize, ports) {

  namespace = namespace || "otiluke";
  initialize = (initialize || ("window."+namespace+" = {eval:eval};")) + template.replace(/@NAMESPACE/g, namespace);
  ports = ports || {};
  ports.http = ports.http || 8080;
  ports.ssl = ports.ssl || 8443;

  var page = Page(namespace, initialize);

  function forward (req, res) {
    delete req.headers["accept-encoding"];
    var parts = url.parse(req.url);
    parts.method = req.method;
    parts.headers = req.headers;
    var pReq = http.request(parts, function (pRes) {
      var type = pRes.headers["content-type"];
      if (type && type.indexOf("text/html") !== -1) {
        delete pRes.headers["content-length"];
        pRes.pipe = page;
      }
      res.writeHead(pRes.statusCode, pRes.statusMessage, pRes.headers);
      pRes.pipe(res);
    });
    pReq.on("error", function (err) {
      process.stderr.write("Error while forwarding request:"+err.message+"\n");
      process.stderr.write(JSON.stringify(parts));
      process.stderr.write("\n\n\n");
    });
    req.pipe(pReq);
  }

  http.createServer(forward).listen(ports.http);

}
