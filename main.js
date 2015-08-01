
// https://newspaint.wordpress.com/2012/11/05/node-js-http-and-https-proxy/
// https://github.com/joeferner/node-http-mitm-proxy/blob/master/lib/proxy.js
// http://blog.vanamco.com/proxy-requests-in-node-js/

// http://www.w3.org/Protocols/HTTP/1.1/draft-ietf-http-v11-spec-01#Request-Line
//   The absoluteURI form is only allowed when the request is being made to a proxy.
//   The proxy is requested to forward the request and return the response.
//   If the request is GET or HEAD and a prior response is cached, the proxy may use the cached message if it passes any restrictions in the Cache-Control and Expires header fields.
//   Note that the proxy may forward the request on to another proxy or directly to the server specified by the absoluteURI.
//   In order to avoid request loops, a proxy must be able to recognize all of its server names, including any aliases, local variations, and the numeric IP address.


var Ca = require("./ca");
var Forward = require("./forward");
var Log = require("./log.js");
var Http = require("http");
var Https = require("https");
var Net = require("net");
var Url = require("url");

module.exports = function (level, namespace, initialize, port) {

  var log = Log(level || "warning");
  var forward = Forward(log, namespace, initialize);
  var proxy = Http.createServer();
  var mocks = {};

  proxy.on("error", function (err) { log.error("proxy ", err.message, "\n\n") });
  proxy.on("request", forward.bind(null, Http));
  proxy.on("upgrade", function () { log.warning("upgrade on proxy\n\n") });
  proxy.on("connect", function (req, csk, head) {
    var host = req.url;
    log.info("connect ", host, "\n\n");
    if (host in mocks)
      return tunnel();
    Ca(host.split(":")[0], function (err, key, crt) {
      if (err) {
        csk.write("HTTP/"+req.httpVersion+" 500 Failed to create certificate");
        log.error("certificate ", err, "\n\n");
      } else {
        // TODO check if we can remove rejectUnauthroized
        mocks[host] = Https.createServer({key:key, cert:crt, rejectUnauthorized:false});
        mocks[host].on("error", function (err) { log.error("mock ", host, " ", err.message+"\n\n") });
        mocks[host].on("request", function (req, res) {
          parts = Url.parse(req.url);
          parts.protocol = "https";
          parts.host = host;
          req.url = Url.format(parts);
          forward(Https, req, res);
        });
        mocks[host].on("upgrade", function () { log.warning("upgrade on mock ", host, "\n\n") });
        mocks[host].on("connect", function () { log.error("connect on mock ", host, "\n\n") });
        mocks[host].listen(0, tunnel);
      }
    });
    function tunnel () {
      var port = mocks[host].address().port;
      log.info("tunnel ", port, "\n\n");
      var psk = Net.createConnection(port, "localhost", function () {
        csk.on("error", function (err) { log.error("client-socket ", host, " ", err.message, "\n\n") });
        psk.on("error", function (err) { log.error("proxy-socket ", host, " ", err.message, "\n\n") });
        psk.write(head);
        log.info("head ", host, " ", head, "\n\n");
        csk.write("HTTP/"+req.httpVersion+" 200 Connection established\r\n\r\n");
        csk.pipe(psk);
        psk.pipe(csk);
      });
    }
  });

  proxy.listen(port || 8080);

}
