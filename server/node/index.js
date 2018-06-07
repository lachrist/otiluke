
var Path = require("path");
var Http = require("http");
var Receptor = require("antena/receptor");

module.exports = function (receptor, vpath) {
  var server = Http.createServer();
  Receptor({
    onrequest: function (method, path, headers, body, callback) {
      return callback(200, "ok", {}, Path.resolve(vpath));
    }
  }).merge({x:receptor}).attach(server);
  return server;
};
