
var Path = require("path");
var Http = require("http");
var Receptor = require("antena/receptor");
var Splitter = require("../splitter.js");

module.exports = function (vpath, receptor) {
  var server = Http.createServer();
  receptor.merge(Splitter, Receptor({
    onrequest: function (method, path, headers, body, callback) {
      return callback(200, "ok", {}, Path.resolve(vpath));
    }
  })).attach(server);
  return server;
};
