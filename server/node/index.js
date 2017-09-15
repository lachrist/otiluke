
var Path = require("path");
var Http = require("http");
var Receptor = require("antena/receptor/node");

module.exports = function (receptor, vpath) {
  var handlers = Receptor({}).merge({
    other: receptor,
    otiluke: Receptor({
      onrequest: function (method, path, headers, body, callback) {
        return callback(200, "ok", {}, Path.resolve(vpath));
      }
    })
  }).handlers();
  var server = Http.createServer();
  server.on("request", handlers.request);
  server.on("upgrade", handlers.upgrade);
  return server;
};
