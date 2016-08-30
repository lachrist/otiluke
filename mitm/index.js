
var Stream = require("stream");
var Path = require("path");
var Crypto = require("crypto");
var Fs = require("fs");
var Browserify = require("browserify");
var Proxy = require("./proxy");
var Reset = require("./proxy/ca/reset.js");
var Log = require("../util/log.js");
var Hijack = require("./hijack.js");

module.exports = function (options) {
  var splitter = Crypto.randomBytes(128).toString("hex");
  options.reset && Reset();
  var stream = new Stream.Readable();
  stream.push(Fs.readFileSync(__dirname+"/template.js", "utf8")
    .replace(/@NAMESPACE/g, function () { return JSON.stringify(options.namespace) })
    .replace(/@TRANSPILE/g, function () { return JSON.stringify(Path.resolve(options.transpile)) })
    .replace(/@SPLITTER/g, function () { return JSON.stringify(splitter) }));
  stream.push(null);
  Browserify(stream).bundle(function (error, setup) {
    if (error)
      throw error;
    var setup = setup.toString("utf8");
    function transform (url) {
      return function (js) {
        return "eval(window["+JSON.stringify(options.namespace)+"].transpile("+JSON.stringify(js)+","+JSON.stringify(url)+"))";
      };
    }
    Proxy(options.port, Hijack(Log(options.log), splitter), function (url, type) {
      if (type.indexOf("javascript") !== -1)
        return transform(url);
      if (type.indexOf("html") !== -1)
        return function (html) {
          return "<script>"+setup+"</script>"+html.replace(regexes.script, function (match, p1, p2, p3, offset) {
            return (regexes.external.test(p1)) ? match : p1+transform(url+"#"+offset)(p2)+p3;
          });
        };
    });
  });
};

var regexes = {
  script: /(<script[^>]*>)([\s\S]*?)(<\/script>)/gi,
  external: /^<script[\s\S]*?src[\s]*?=[\s\S]*?>$/i
};
