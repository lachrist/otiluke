
var Proxy = require("./proxy");
var Reset = require("./proxy/ca/reset.js");
var Onrequest = require("./onrequest.js");
var Onsocket = require("./onsocket.js");
var Normalize = require("../util/normalize.js");

module.exports = function (options) {
  options.hijack = Normalize.hijack(options.hijack);
  options.sphere = Normalize.sphere(options.sphere);
  options.namespace = options.namespace || "otiluke"+Math.random().toString(36).substring(2);
  return Proxy(Onrequest(options), Onsocket(options));
};

module.exports.reset = Reset;
