
var Http = require("http");
var Https = require("https");

var Ca = require("./ca");
var Log = require("../../util/log.js");
var Extract = require("./lib/extract.js");
var Forward = require("./lib/forward.js");
var Idles = require("./lib/idles.js");
var Queue = require("./lib/queue.js");
var Tunnel = require("./lib/tunnel.js");

module.exports = function (port, intercept) {
  var mocks = Idles(2*60*1000);
  var proxy = Http.createServer();
  proxy.listen(port);
  proxy.on("error", Log("proxy"));
  proxy.on("request", function (req, res) { Forward(intercept, Http, Extract(req), req, res) });
  proxy.on("connect", function (req, socket, head) {
    (mocks.get(req.url)||mock(req.url, mocks, intercept)).tunnel(socket, head);
  });
};

function mock (host, mocks, intercept) {
  var hostname = host.split(":")[0];
  var port = host.split(":")[1];
  Ca(hostname, function (key, cert) {
    var server = Https.createServer({key:key, cert:cert, rejectUnauthorized:false});
    server.on("request", function (req, res) {
      var parts = Extract(req);
      parts.protocol = "https:";
      parts.hostname = hostname;
      parts.port = port;
      Forward(intercept, Https, parts, req, res);
    });
    server.on("error", Log(host));
    server.listen(0, function () {
      var tunnel = Tunnel(server.address().port);
      mocks.get(host).purge(tunnel);
      mocks.set(host, {tunnel:tunnel, close:server.close.bind(server)});
    });
  });
  return mocks.set(host, Queue());
}
