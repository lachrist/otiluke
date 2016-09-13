
var Stream = require("stream");
var Path = require("path");
var Crypto = require("crypto");
var Fs = require("fs");
var Browserify = require("browserify");
var Proxy = require("./proxy");
var Reset = require("./proxy/ca/reset.js");
var Log = require("../util/log.js");
var Hijack = require("./hijack.js");
var Bind = require("../util/bind.js");

function cst (string) {
  return function () {
    return string;
  };
}

module.exports = function (options) {
  options.reset && Reset();
  if (!options.transpile)
    return;
  var splitter = "otiluke"+Crypto.randomBytes(64).toString("base64")
    .replace(/\+/g, cst("_"))
    .replace(/\//g, cst("$"))
    .replace(/\=/g, cst(""));
  var stream = new Stream.Readable();
  stream.push(Bind(Fs.readFileSync(__dirname+"/template.js", "utf8"), {
    "@TRANSPILE": JSON.stringify(Path.resolve(options.transpile)),
    "@SPLITTER": JSON.stringify(splitter)
  }));
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
