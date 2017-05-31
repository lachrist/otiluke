
var Http = require("http");
var Ws = require("ws");
var Path = require("path");
var Normalize = require("../common/normalize.js");

module.exports = function (options) {
  options = Normalize(options);
  var server = Http.createServer(function (req, res) {
    if (options.intercept.request(req, res))
      return;
    if (req.url === "/otiluke-sphere")
      return res.end(JSON.stringify(options.sphere));
    res.writeHead(400, "request not intercepted");
    res.end();
  });
  (new Ws.Server({server:server})).on("connection", function (socket) {
    if (options.intercept.connect(socket))
      return;
    socket.close(4000, "connect not intercepted");
  });
  return server;
};
