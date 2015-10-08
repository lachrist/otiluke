
// https://newspaint.wordpress.com/2012/11/05/node-js-http-and-https-proxy/
// https://github.com/joeferner/node-http-mitm-proxy/blob/master/lib/proxy.js
// http://blog.vanamco.com/proxy-requests-in-node-js/

// http://www.w3.org/Protocols/HTTP/1.1/draft-ietf-http-v11-spec-01#Request-Line
//   The absoluteURI form is only allowed when the request is being made to a proxy.
//   The proxy is requested to forward the request and return the response.
//   If the request is GET or HEAD and a prior response is cached, the proxy may use the cached message if it passes any restrictions in the Cache-Control and Expires header fields.
//   Note that the proxy may forward the request on to another proxy or directly to the server specified by the absoluteURI.
//   In order to avoid request loops, a proxy must be able to recognize all of its server names, including any aliases, local variations, and the numeric IP address.

var Fs = require("fs");
var Ca = require("./ca");
var Forward = require("./forward");
var Log = require("./log.js");
var Http = require("http");
var Https = require("https");
var Net = require("net");
var Url = require("url");

// {log:string, port:string, init:string, namespace:string, record:{port:string, file:string}}
module.exports = function (opts) {

  var log = Log(opts.log);
  var mcks = {};

  if (opts.record)
    Ca("localhost", function (err, key, crt) {
      var hst = "localhost:"+opts.record.port;
      var wrs = Fs.createWriteStream(opts.record.file);
      var hdrs = {
        "Content-Type": "text/plain",
        "Content-Length": "0",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Max-Age": String(24*60*60),
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Connection": "Keep-Alive"
      };
      mcks[hst] = Https.createServer({key:key, cert:crt});
      mcks[hst].on("error", function (err) { log.error("record ", err.message, "\n\n") });
      mcks[hst].on("upgrade", function (err) { log.warning("upgrade on record") });
      mcks[hst].on("connection", function (sck) { sck.setKeepAlive(true, 10*60*1000) });
      mcks[hst].on("request", function (req, res) {
        log.info("logging ", req.headers.origin, "\n\n");
        res.writeHead(200, hdrs);
        req.on("data", function (chk) { wrs.write(chk); console.log(chk.toString("utf8")) });
        req.on("end", function () { res.end() })
      });
      mcks[hst].listen(opts.record.port, mitm);
    });
  else
    mitm();

  function mitm () {
    var fwd = Forward(log, opts.namespace, opts.init);
    var pxy = Http.createServer();
    pxy.on("error", function (err) { log.error("proxy ", err.message, "\n\n") });
    pxy.on("request", fwd.bind(null, Http));
    pxy.on("upgrade", function () { log.warning("upgrade on proxy\n\n") });
    pxy.on("connect", function (req, csk, head) {
      var hst = req.url;
      log.info("connect ", hst, "\n\n");
      if (hst in mcks)
        return tunnel();
      Ca(hst.split(":")[0], function (err, key, crt) {
        if (err) {
          csk.write("HTTP/"+req.httpVersion+" 500 Failed to create certificate");
          log.error("certificate ", err, "\n\n");
        } else {
          // TODO check if we can remove rejectUnauthroized
          mcks[hst] = Https.createServer({key:key, cert:crt, rejectUnauthorized:false});
          mcks[hst].on("error", function (err) { log.error("mock ", hst, " ", err.message, "\n\n") });
          mcks[hst].on("request", function (req, res) {
            parts = Url.parse(req.url);
            parts.protocol = "https";
            parts.host = hst;
            req.url = Url.format(parts);
            fwd(Https, req, res);
          });
          mcks[hst].on("upgrade", function () { log.warning("upgrade on mock ", hst, "\n\n") });
          mcks[hst].on("connect", function () { log.error("connect on mock ", hst, "\n\n") });
          mcks[hst].listen(0, tunnel);
        }
      });
      function tunnel () {
        var port = mcks[hst].address().port;
        log.info("tunnel ", port, "\n\n");
        var psk = Net.createConnection(port, "localhost", function () {
          csk.on("error", function (err) { log.error("client-socket ", hst, " ", err.message, "\n\n") });
          psk.on("error", function (err) { log.error("proxy-socket ", hst, " ", err.message, "\n\n") });
          psk.write(head);
          log.info("head ", hst, " ", head, "\n\n");
          csk.write("HTTP/"+req.httpVersion+" 200 Connection established\r\n\r\n");
          csk.pipe(psk);
          psk.pipe(csk);
        });
      }
    });
    pxy.listen(opts.port || 8080);
  }

}

