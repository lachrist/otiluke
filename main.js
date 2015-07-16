
// https://newspaint.wordpress.com/2012/11/05/node-js-http-and-https-proxy/
// https://github.com/joeferner/node-http-mitm-proxy/blob/master/lib/proxy.js

// http://www.w3.org/Protocols/HTTP/1.1/draft-ietf-http-v11-spec-01#Request-Line
//   The absoluteURI form is only allowed when the request is being made to a proxy.
//   The proxy is requested to forward the request and return the response.
//   If the request is GET or HEAD and a prior response is cached, the proxy may use the cached message if it passes any restrictions in the Cache-Control and Expires header fields.
//   Note that the proxy may forward the request on to another proxy or directly to the server specified by the absoluteURI.
//   In order to avoid request loops, a proxy must be able to recognize all of its server names, including any aliases, local variations, and the numeric IP address.

var util = require("util");
var fs = require("fs");
var url = require("url");
var http = require("http");
var https = require("https");
var protocols = {"http:":http, "https:":https};
var net = require("net");
var Page = require("./page.js");
var template = fs.readFileSync(__dirname+"/template.js", {encoding:"utf8"});
var key = fs.readFileSync(__dirname+"/certificate/key.pem", {encoding:"utf8"});
var cert = fs.readFileSync(__dirname+"/certificate/cert.pem", {encoding:"utf8"});
var definit = [
  "window.@NAMESPACE = {",
  "  script: function (js, src) { eval(js) },",
  "  handler: function (node, name, js) { node[name] = new Function('event', js) }",
  "};"
].join("\n");

var spawn = require('child_process').spawn;

module.exports = function (namespace, initialize, port) {

  namespace = namespace||"otiluke";
  initialize = ((initialize||definit)+template).replace(/@NAMESPACE/g, namespace);
  port = port || 8080;

  function forward (opts, req, res) {
    console.log("FORWARD: "+JSON.stringify(opts)+"\n");
    delete req.headers["accept-encoding"];
    opts.method = req.method;
    opts.headers = req.headers;
    var pReq = protocols[opts.protocol].request(opts, function (pRes) {
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
      process.stderr.write(req.url+"\n"+JSON.stringify(parts)+"\n\n");
    });
    req.pipe(pReq);
  }

  var page = Page(namespace, initialize);
  var proxy = http.createServer(function (req, res) {
    forward(url.parse(req.url), req, res);
  });
  var servers = {};

  proxy.listen(port);

  proxy.on("connect", function (req, csk, head) {
    console.log("CONNECT: "+req.url+"\n");
    if (req.url in servers)
      return tunnel();
    var parts = /^(.+):([0-9]+)$/.exec(req.url);
    // We assume the connection is HTTPS which is not necessarly the case.
    servers[req.url].listen(0, tunnel);
    function tunnel () {
      var opts = {host:"localhost", port:servers[req.url].address().port};
      var psk = new net.createConnection(opts, function () {
        psk.write(head);
        csk.write("HTTP/"+req.httpVersion+" 200 Connection established\r\n\r\n");
      });
      psk.pipe(csk);
      csk.pipe(psk);
    }
  });

}


    // csk.on("data", function (chunk) { psk.write(chunk) });
    // csk.on("end", function () { psk.end() });
    // csk.on("error", function (err) {
    //   process.stderr.write("Error at Client TCP socket: "+err.message+"\n");
    //   process.stderr.write(req.url+"\n\n\n");
    //   psk.end();
    // });
    // psk.on("data", function (chunk) {
    //   console.log(chunk.toString());
    //   csk.write(chunk);
    // });
    // psk.on("end", function () { csk.end() });
    // psk.on("error", function (err) {
    //   process.stderr.write("Error at Proxy TCP socket: "+err.message+"\n");
    //   process.stderr.write(req.url+"\n\n\n");
    //   csk.end();
    // });
  

  // Lets *not* support websocket right now! 
  // server.on("upgrade", function (request, socket, head) {
  //   console.log(request.headers);
  // });
