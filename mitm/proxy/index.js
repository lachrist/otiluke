
var Http = require("http");
var Https = require("https");
var Ws = require("ws");
var Url = require("url");

var Ca = require("./ca");
var Tunnel = require("./tunnel.js");
var Heartbeat = require("./heartbeat.js");

module.exports = function (port, onrequest, onconnection) {
  var pendings = {};
  var tunnels = {};
  var proxy = Http.createServer();
  var heartbeat = Heartbeat(function (name) { delete tunnels[name] });
  proxy.on("error", Signal(__filename+"-proxy"));
  proxy.on("connect", function (request, socket, head) {
    if (request.url in tunnels)
      return tunnels[request.url](socket, head);
    if (request.url in pendings)
      return pendings[request.url].push([socket, head]);
    pendings[request.url] = [[socket, head]];
    Ca(request.url.split(":")[0], function (key, cert) {
      var server = Https.createServer({key:key, cert:cert});
      server.on("request", function (req, res) { onrequest(request.url, req, res) });
      Ws.Server({server:server}).on("connection", function (ws) { onconnection(request.url, ws) });
      server.on("error", Signal(__filename+"-mock-"+request.url));
      server.listen(0, function () {
        heartbeat(request.url, server);
        tunnels[request.url] = Tunnel(server.address().port);
        pendings[request.url].forEach(function (xs) { tunnels[request.url](xs[0], xs[1]) });
        delete pendings[request.url];
      });
    });
  });
  proxy.on("request", function (req, res) { onrequest(req.headers.host, req, res) });
  proxy.listen(port, function () {
    process.stdout.write("Man-in-the-middle attack ready on localhost:"+proxy.address().port+"\n");
  });
};

