
var Stream = require("stream");
var Path = require("path");
var Crypto = require("crypto");
var Fs = require("fs");
var Browserify = require("browserify");
var Proxy = require("./proxy");
var Reset = require("./proxy/ca/reset.js");

function cst (string) {
  return function () {
    return string;
  };
}

module.exports = function (options) {
  options.reset && Reset();
  if (!options.transpile)
    return;
  var splitter = "otiluke"+Crypto.randomBytes(64).toString("hex");
  var readable = new Stream.Readable();
  readable.push("var SPLITTER = "+JSON.stringify(splitter)+";\n");
  readable.push("var TRANSPILE = require("+JSON.stringify(Path.resolve(options.transpile))+");\n");
  if (options.melf)
    readable.push("var MELF = "+JSON.stringify({
      channel: splitter,
      alias: options.melf.alias,
      wait: options.melf.wait || 10
    })+";\n");
  else
    readable.push("var MELF = null;\n")
  stream.push(Fs.readFileSync(__dirname+"/template.js", "utf8"));
  stream.push(null);
  Browserify(stream).bundle(function (error, setup) {
    if (error)
      throw error;
    var setup = setup.toString("utf8");
    function transform (url) {
      return function (js) {
        return "eval("+splitter+"("+JSON.stringify(js)+","+JSON.stringify(url)+"))";
      };
    }
    Proxy(options.port, Hijack(options.onsocket, splitter), function (url, type) {
      if (type.indexOf("javascript") !== -1)
        return transform(url);
      if (type.indexOf("html") !== -1)
        return function (html) {
          
        };
    });
  });
};

var regexes = {
  script: /(<script[^>]*>)([\s\S]*?)(<\/script>)/gi,
  external: /^<script[\s\S]*?src[\s]*?=[\s\S]*?>$/i
};
