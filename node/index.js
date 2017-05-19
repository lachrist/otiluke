
var Http = require("http");
var Ws = require("ws");
var Path = require("path");
var Normalize = require("../util/normalize.js");

exports.argv = function (sphere, port) {
  return [
    Path.join(__dirname, "launch.js"),
    JSON.stringify({
      sphere: Normalize.sphere(sphere),
      port: port
    })
  ];
};

exports.server = function (hijack) {
  hijack = Normalize.hijack(hijack);
  var server = Http.createServer(function (req, res) {
    if (!hijack.request(req, res)) {
      res.writeHead(400, "request not hijacked");
      res.end();
    }
  });
  (new Ws.Server({server:server})).on("connection", function (socket) {
    if (!hijack.socket(socket)) {
      socket.close(4000, "socket not hijacked");
    }
  });
  return server;
};
