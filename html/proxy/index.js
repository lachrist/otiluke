
var Http = require("http");
var Https = require("https");
var Ws = require("ws");
var Url = require("url");

var Ca = require("./ca");
var Heartbeat = require("./heartbeat.js");

module.exports = function (onrequest, onconnect) {
  var pendings = {};
  var heartbeat = Heartbeat();
  function mock (host, server) {
    server.on("request", function (req, res) {
      onrequest(host, req, res);
    });
    (new Ws.Server({server:server})).on("connection", function (ws) {
      onconnect(host, ws);
    });
    server.listen(0, function () {
      heartbeat.set(host, server);
      pendings[host].forEach(function (xs) {
        heartbeat.get(host)(xs[0], xs[1]);
      });
      delete pendings[host];
    });
  };
  var proxy = Http.createServer();
  proxy.on("connect", function (request, socket, head) {
    if (heartbeat.get(request.url))
      return heartbeat.get(request.url)(socket, head);
    if (request.url in pendings)
      return pendings[request.url].push([socket, head]);
    pendings[request.url] = [[socket, head]];
    Http.request("http://"+request.url, function () {
      mock(request.url, Http.createServer());
    }).on("error", function () {
      Ca(request.url.split(":")[0], function (error, result) {
        if (error)
          return socket.end(String(error), "utf8");
        mock(request.url, Https.createServer(result));
      });
    }).end();
  });
  proxy.on("request", function (req, res) {
    onrequest(req.headers.host, req, res);
  });
  proxy.on("close", function () {
    heartbeat.close();
  });
  return proxy;
};

