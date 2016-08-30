
var Http = require("http");
var Https = require("https");
var Ws = require("ws");
var Url = require("url");

var Ca = require("./ca");
var Error = require("../../util/error.js");
var Forward = require("./forward.js");
var Tunnel = require("./tunnel.js");
var Heartbeat = require("./heartbeat.js");

module.exports = function (port, hijack, intercept) {
  var pendings = {};
  var tunnels = {};
  var proxy = Http.createServer();
  var servers = [];
  var heartbeat = Heartbeat(function (name) { delete tunnels[name] });
  proxy.on("error", Error(__filename+"-proxy"));
  proxy.on("connect", function (req, socket, head) {
    if (req.url in tunnels)
      return tunnels[req.url](socket, head);
    if (req.url in pendings)
      return pendings[req.url].push([socket, head]);
    pendings[req.url] = [[socket, head]];
    Ca(req.url.split(":")[0], function (key, cert) {
      var server = Https.createServer({key:key, cert:cert});
      server.on("request", Forward(intercept, req.url));
      server.on("error", Error(__filename+"-mock-"+req.url));
      server.listen(0, function () {
        heartbeat(req.url, server);
        hijack(req.url, server);
        tunnels[req.url] = Tunnel(server.address().port);
        pendings[req.url].forEach(function (xs) { tunnels[req.url](xs[0], xs[1]) });
        delete pendings[req.url];
      });
    });
  });
  proxy.on("request", function (req, res) {
    Forward(intercept, req.headers.host)(req, res);
  });
  proxy.listen(port, function () {
    process.stdout.write("Man-in-the-middle attack ready on localhost:"+proxy.address().port+"\n");
  });
};

