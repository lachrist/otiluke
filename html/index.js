
var Proxy = require("./proxy");
var Reset = require("./proxy/ca/reset.js");
var Onrequest = require("./onrequest.js");
var Onconnect = require("./onconnect.js");
var Normalize = require("../common/normalize.js");

module.exports = function (options) {
  options = Normalize(options);
  options.namespace = options.namespace || "otiluke"+Math.random().toString(36).substring(2);
  return Proxy(Onrequest(options), Onconnect(options));
};

module.exports.reset = Reset;
