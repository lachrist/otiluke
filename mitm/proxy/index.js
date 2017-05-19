
var Http = require("http");
var Https = require("https");
var Ws = require("ws");
var Url = require("url");

var Ca = require("./ca");
var Heartbeat = require("./heartbeat.js");

module.exports = function (onrequest, onsocket) {
  var pendings = {};
  var proxy = Http.createServer();
  var heartbeat = Heartbeat();
  proxy.on("connect", function (request, socket, head) {
    if (heartbeat.get(request.url))
      return heartbeat.get(request.url)(socket, head);
    if (request.url in pendings)
      return pendings[request.url].push([socket, head]);
    pendings[request.url] = [[socket, head]];
    Ca(request.url.split(":")[0], function (error, result) {
      if (error)
        return socket.end(String(error), "utf8");
      var server = Https.createServer(result);
      server.on("request", function (req, res) {
        onrequest(request.url, req, res);
      });
      (new Ws.Server({server:server})).on("connection", function (ws) {
        onsocket(request.url, ws);
      });
      server.listen(0, function () {
        heartbeat.set(request.url, server);
        pendings[request.url].forEach(function (xs) {
          heartbeat.get(request.url)(xs[0], xs[1]);
        });
        delete pendings[request.url];
      });
    });
  });
  proxy.on("request", function (req, res) { onrequest(req.headers.host, req, res) });
  proxy.on("close", function () {
    heartbeat.close();
  });
  return proxy;
};

