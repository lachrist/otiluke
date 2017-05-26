
var Http = require("http");
var Ws = require("ws");
var Path = require("path");
var Normalize = require("../common/normalize.js");

module.exports = function (options) {
  var hijack = Normalize.hijack(options.hijack);
  var sphere = Normalize.sphere(options.sphere);
  var server = Http.createServer(function (req, res) {
    if (hijack.request(req, res))
      return;
    if (req.url === "/otiluke-sphere")
      return res.end(options.stringify(sphere));
    res.writeHead(400, "request not hijacked");
    res.end();
  });
  (new Ws.Server({server:server})).on("connection", function (socket) {
    if (hijack.socket(socket))
      return;
    socket.close(4000, "socket not hijacked");
  });
  return server;
};
