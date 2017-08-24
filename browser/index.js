
var Http = require("http");
var Https = require("https");
var Url = require("url");

var Ca = require("./ca");
var Mock = require("./mock.js");
var Forward = require("./forward.js");
var Transform = require("./transform.js");

module.exports = function (path, receptor) {
  var prefix = "/otiluke"+Math.random().toString(36).substring(2);
  var transform = Transform(path, {
    namespace: "otiluke"+Math.random().toString(36).substring(2),
    prefix: prefix,
    key: "otiluke"
  });
  var mock = Mock(2*60*1000, function (host, server) {
    Foward(host, transform).split(prefix, receptor).attach(server);
  });
  var proxy = Http.createServer();
  proxy.on("connect", function (request, socket, head) {
    mock.link(request.url, socket, head);
  });
  proxy.on("request", function (req, res) {
    var fake = new Events();
    Forward(req.headers.host).split(prefix, receptor).attach(fake);
    fake.emit("request", req, res);
  });
  proxy.on("close", mock.close);
  return proxy;
};
