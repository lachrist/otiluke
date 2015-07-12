
var fs = require("fs");
var url = require("url");
var http = require("http");
var Page = require("./page.js")
var template = fs.readFileSync(__dirname+"/template.js", {encoding:"utf8"});

module.exports = function (namespace, initialize, ports, origins) {

  namespace = namespace || "otiluke";
  initialize = (initialize || ("window."+namespace+" = {eval:eval};")) + template.replace(/@NAMESPACE/g, namespace);
  ports = ports || {};
  ports.http = ports.http || 8080;
  ports.ssl = ports.ssl || 8443;
  origins = origins || [];

  var page = Page(namespace, initialize);

  http.createServer(function(req, res) {
    var parts = url.parse(req.url);
    var options = {
      method: req.method,
      hostname: parts.hostname,
      port: parts.port,
      path: parts.path,
      headers: req.headers
    };
    var pReq = http.request(options, function (pRes) {
      if ("origin" in req.headers && origins.indexOf(req.headers.host) !== -1)
        pRes.headers["access-control-allow-origin"] = req.headers["origin"];
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
      process.stderr.write(JSON.stringify(options));
      process.stderr.write("\n\n\n");
    });
    req.pipe(pReq);
  }).listen(ports.http);

}
