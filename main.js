
// https://newspaint.wordpress.com/2012/11/05/node-js-http-and-https-proxy/
// https://github.com/joeferner/node-http-mitm-proxy/blob/master/lib/proxy.js
// http://blog.vanamco.com/proxy-requests-in-node-js/

// http://www.w3.org/Protocols/HTTP/1.1/draft-ietf-http-v11-spec-01#Request-Line
//   The absoluteURI form is only allowed when the request is being made to a proxy.
//   The proxy is requested to forward the request and return the response.
//   If the request is GET or HEAD and a prior response is cached, the proxy may use the cached message if it passes any restrictions in the Cache-Control and Expires header fields.
//   Note that the proxy may forward the request on to another proxy or directly to the server specified by the absoluteURI.
//   In order to avoid request loops, a proxy must be able to recognize all of its server names, including any aliases, local variations, and the numeric IP address.

// openssl genrsa -out key.pem 2048
// openssl req -new -sha256 -key ca-key.pem -out csr.pem
// openssl x509 -req -in csr.pem -signkey key.pem -out cert.pem

// openssl ca -keyfile

var html = require("./html.js");
var ca = require("./ca.js");
var url = require("url");
var http = require("http");
var https = require("https");
var protocols = {"http:":http, "https:":https};
var net = require("net");
var definit = [
  "window.@NAMESPACE = {",
  "  script: function (js, src) { eval(js) },",
  "  handler: function (node, name, js) { node[name] = new Function('event', js) }",
  "};"
].join("\n");

module.exports = function (namespace, initialize, port) {

  namespace = namespace||"otiluke";
  initialize = initialize||definit;
  port = port || 8080;

  // parts: {protocol:String, hostname:String, port:Number, path:String}
  function forward (parts, req, res) {
    console.log("FORWARD: "+JSON.stringify(parts)+"\n");
    delete req.headers["accept-encoding"];
    parts.method = req.method;
    parts.headers = req.headers;
    var pReq = protocols[parts.protocol].request(parts, function (pRes) {
      var type = pRes.headers["content-type"];
      if (type && type.indexOf("text/html") !== -1) {
        delete pRes.headers["content-length"];
        pRes.pipe = pipe;
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

  var pipe = html(namespace, initialize);
  var proxy = http.createServer();
  var mocks = {};

  proxy.on("error", function (err) { process.stderr.write("Error on proxy "+err.message) });
  proxy.on("request", function (req, res) { forward(url.parse(req.url), req, res) });
  proxy.on("upgrade", function () { throw new Error("Upgrade not supported [proxy]") });
  proxy.on("connect", function (req, csk, head) {
    console.log("CONNECT: "+req.url+"\n");
    if (req.url in mocks)
      return tunnel();
    var parts = url.parse("https://"+req.url); // We assume the connection is HTTPS which is not necessarly the case.
    ca(parts.hostname, function (err, key, crt) {
      if (err) {
        csk.write("HTTP/"+req.httpVersion+" 500 Failed to create certificate");
        process.stderr.write("CERTIFICATE ERROR: "+err+"\n\n\n");
      } else {
        mocks[req.url] = https.createServer({key:key, crt:crt});
        mocks[req.url].on("error", function (err) { process.stderr.write("Error on mitm "+err.message) });
        mocks[req.url].on("request", function (req, res) { forward(parts, req, res) });
        mocks[req.url].on("upgrade", function () { throw new Error("Upgrade not supported [https]") });
        mocks[req.url].on("connect", function () { throw new Error("Connect not supported [https]") });
        mocks[req.url].listen(0, tunnel);
      }
    });
    function tunnel () {
      var port = mocks[req.url].address().port;
      console.log("TUNNEL "+port+" "+head);
      var psk = new net.createConnection(port, "localhost", function () {
        csk.on("error", function (err) { process.stderr.write("Error on client socket "+err.message) });
        psk.on("error", function (err) { process.stderr.write("Error on proxy socket "+err.message) });
        psk.write(head);
        console.log("HEAD: "+head);
        csk.write("HTTP/"+req.httpVersion+" 200 Connection established\r\n\r\n");
        csk.pipe(psk);
        psk.pipe(csk);
      });
    }
  });
  proxy.listen(port);

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
