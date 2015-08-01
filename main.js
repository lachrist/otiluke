
// https://newspaint.wordpress.com/2012/11/05/node-js-http-and-https-proxy/
// https://github.com/joeferner/node-http-mitm-proxy/blob/master/lib/proxy.js
// http://blog.vanamco.com/proxy-requests-in-node-js/

// http://www.w3.org/Protocols/HTTP/1.1/draft-ietf-http-v11-spec-01#Request-Line
//   The absoluteURI form is only allowed when the request is being made to a proxy.
//   The proxy is requested to forward the request and return the response.
//   If the request is GET or HEAD and a prior response is cached, the proxy may use the cached message if it passes any restrictions in the Cache-Control and Expires header fields.
//   Note that the proxy may forward the request on to another proxy or directly to the server specified by the absoluteURI.
//   In order to avoid request loops, a proxy must be able to recognize all of its server names, including any aliases, local variations, and the numeric IP address.

var html = require("./html.js");
var ca = require("./ca.js");
var Log = require("./log.js");
var url = require("url");
var http = require("http");
var https = require("https");
var net = require("net");
var definit = [
  "window.@NAMESPACE = {",
  "  script: function (js, src) { eval(js) },",
  "  handler: function (node, name, js) { node[name] = new Function('event', js) }",
  "};"
].join("\n");

module.exports = function (level, namespace, initialize, port) {

  log = Log(level || "warning");
  namespace = namespace || "otiluke";
  initialize = initialize || definit;
  port = port || 8080;

  function forward (protocol, host, req, res) {
    delete req.headers["accept-encoding"];
    var parts = host.split(":")
    var opts = {
      hostname: parts[0],
      port: parts[1] || ((protocol===https)?443:80),
      method: req.method,
      path: url.parse(req.url).path,
      headers: req.headers
    };
    log.info("forward: "+JSON.stringify(opts)+"\n\n");
    var pReq = protocol.request(opts, function (pRes) {
      var type = pRes.headers["content-type"];
      if (type && type.indexOf("text/html") !== -1) {
        delete pRes.headers["content-length"];
        pRes.pipe = pipe;
      }
      if (pRes.statusCode !== 200)
        log.warning(pRes.statusCode+" "+pRes.statusMessage+" "+JSON.stringify(opts)+"\n\n");
      res.writeHead(pRes.statusCode, pRes.statusMessage, pRes.headers);
      pRes.pipe(res);
    });
    pReq.on("error", function (err) { log.error("forward "+err.message+" "+JSON.stringify(opts)+"\n\n") });
    req.pipe(pReq);
  }

  var pipe = html(namespace, initialize);
  var proxy = http.createServer();
  var mocks = {};

  proxy.on("error", function (err) { log.error("proxy "+err.message+"\n\n") });
  proxy.on("request", function (req, res) { forward(http, req.headers.host, req, res) });
  proxy.on("upgrade", function () { log.warning("upgrade on proxy\n\n") });
  proxy.on("connect", function (req, csk, head) {
    var host = req.url;
    log.info("connect "+host+"\n\n");
    if (host in mocks)
      return tunnel();
    ca(host.split(":")[0], function (err, key, crt) {
      if (err) {
        csk.write("HTTP/"+req.httpVersion+" 500 Failed to create certificate");
        log.error("certificate "+err+"\n\n");
      } else {
        mocks[host] = https.createServer({key:key, cert:crt});
        mocks[host].on("error", function (err) { log.error("mock "+host+" "+err.message+"\n\n") });
        mocks[host].on("request", function (req, res) { forward(https, host, req, res) });
        mocks[host].on("upgrade", function () { log.warning("upgrade on mock "+host+"\n\n") });
        mocks[host].on("connect", function () { log.error("connect on mock "+host+"\n\n") });
        mocks[host].listen(0, tunnel);
      }
    });
    function tunnel () {
      var port = mocks[host].address().port;
      log.info("tunnel "+port+"\n\n");
      var psk = new net.createConnection(port, "localhost", function () {
        csk.on("error", function (err) { log.error("client-socket "+host+" "+err.message+"\n\n") });
        psk.on("error", function (err) { log.error("proxy-socket "+host+" "+err.message+"\n\n") });
        psk.write(head);
        log.info("head "+host+" "+head+"\n\n");
        csk.write("HTTP/"+req.httpVersion+" 200 Connection established\r\n\r\n");
        csk.pipe(psk);
        psk.pipe(csk);
      });
    }
  });
  proxy.listen(port);

}
