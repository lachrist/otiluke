
var Http = require("http");
var Https = require("https");
var Url = require("url");

var Ca = require("./ca");
var Mock = require("./mock.js");
var Forward = require("./forward.js");
var Transform = require("./transform.js");

module.exports = function (receptor, vpath, constants) {
  constants = constants || {};
  constants.namespace = constants.namespace || "otiluke"+Math.random().toString(36).substring(2);
  constants.splitter = constants.splitter || "/otiluke"+Math.random().toString(36).substring(2);
  constants.urlkey = constants.urlkey || "otiluke";
  var transform = Transform(vpath, constants);
  var mock = Mock(2*60*1000, function (host, server) {
    Forward(host, transform).merge({
      [constants.splitter]: receptor
    }).attach(server);
  });
  var proxy = Http.createServer();
  proxy.on("connect", function (request, socket, head) {
    mock.link(request.url, socket, head);
  });
  proxy.on("request", function (req, res) {
    Forward(req.headers.host).merge({
      [constants.splitter]: receptor
    }).handlers("request")(req, res);
  });
  proxy.on("close", mock.close);
  return proxy;
};