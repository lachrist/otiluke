
var Path = require("path");
var Http = require("http");
var Receptor = require("antena/receptor");

module.exports = function (vpath, receptor) {
  var server = Http.createServer();
  receptor.merge("/__otiluke__", Receptor({
    onrequest: function (method, path, headers, body, callback) {
      return callback(200, "ok", {}, Path.resolve(vpath));
    }
  })).attach(server);
  return server;
};
