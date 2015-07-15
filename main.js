
// https://newspaint.wordpress.com/2012/11/05/node-js-http-and-https-proxy/

var fs = require("fs");
var url = require("url");
var http = require("http");
var https = require("https");
var net = require("net");
var Page = require("./page.js")
var template = fs.readFileSync(__dirname+"/template.js", {encoding:"utf8"});

module.exports = function (namespace, initialize, port) {

  namespace = namespace || "otiluke";
  initialize = (initialize || ("window."+namespace+" = {script:eval};")) + template.replace(/@NAMESPACE/g, namespace);
  port = port || 8080;

  var page = Page(namespace, initialize);

  var server = http.createServer(function (req, res) {
    delete req.headers["accept-encoding"];
    var parts = url.parse(req.url);
    console.log(req.method+" "+req.url);
    console.log(parts);
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
      process.stderr.write("Error while forwarding request: "+err.message+"\n");
      process.stderr.write(req.url+"\n\n\n");
    });
    req.pipe(pReq);
  });

  server.on("connect", function (req, csk, head) {
    var parts = /^(.+):([0-9]+)$/.exec(req.url); // url.parse does not work
    console.log(req.method+" "+req.url);
    console.log(parts);
    var psk = new net.createConnection({host:parts[1], port:parts[2]}, function () {
      psk.write(head);
      csk.write("HTTP/"+req.httpVersion+" 200 Connection established\r\n\r\n");
    });
    csk.on("data", function (chunk) { psk.write(chunk) });
    csk.on("end", function () { psk.end() });
    csk.on("error", function (err) {
      process.stderr.write("Error at Client TCP socket: "+err.message+"\n");
      process.stderr.write(req.url+"\n\n\n");
      psk.end();
    });
    psk.on("data", function (chunk) { csk.write(chunk) });
    psk.on("end", function () { csk.end() });
    psk.on("error", function (err) {
      process.stderr.write("Error at Proxy TCP socket: "+err.message+"\n");
      process.stderr.write(req.url+"\n\n\n");
      csk.end();
    });
  });

  // Lets *not* support websocket right now! 
  // server.on("upgrade", function (request, socket, head) {
  //   console.log(request.headers);
  // });

  server.listen(port);

}
