
var Path = require("path");
var Http = require("http");
var Receptor = require("antena/receptor");
var ReceptorMerge = require("antena/receptor/merge");

module.exports = function (vpath, receptor) {
  var server = Http.createServer();
  ReceptorMerge({
    otiluke: Receptor({
      onrequest: function (method, path, headers, body, callback) {
        return callback(200, "ok", {}, Path.resolve(vpath));
      }
    }),
    other: receptor
  }).attach(server);
  return server;
};
