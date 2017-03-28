
var Http = require("http");
var Https = require("https");
var Ws = require("ws");
var Url = require("url");

var Ca = require("./ca");
var Tunnel = require("./tunnel.js");
var Heartbeat = require("./heartbeat.js");

module.exports = function (port, onrequest, onsocket, callback) {
  var pendings = {};
  var tunnels = {};
  var proxy = Http.createServer();
  var heartbeat = Heartbeat();
  proxy.on("error", callback);
  proxy.on("connect", function (request, socket, head) {
    if (heartbeat(request.url))
      return heartbeat(request.url)(socket, head);
    if (request.url in pendings)
      return pendings[request.url].push([socket, head]);
    pendings[request.url] = [[socket, head]];
    Ca(request.url.split(":")[0], function (key, cert) {
      var server = Https.createServer({key:key, cert:cert});
      server.on("request", function (req, res) { onrequest(request.url, req, res) });
      Ws.Server({server:server}).on("connection", function (ws) { onsocket(request.url, ws) });
      server.listen(0, function () {
        heartbeat(request.url, server);
        pendings[request.url].forEach(function (xs) { heartbeat(request.url)[request.url](xs[0], xs[1]) });
        delete pendings[request.url];
      });
    });
  });
  proxy.on("request", function (req, res) { onrequest(req.headers.host, req, res) });
  proxy.listen(port, function () {
    proxy.removeAllListeners("error");
    callback(null, proxy.address().port);
  });
};

