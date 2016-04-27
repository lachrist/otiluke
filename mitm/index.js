
var Stream = require("stream");
var Path = require("path");
var Browserify = require("browserify");
var Proxy = require("./proxy");
var Reset = require("./proxy/ca/reset.js");

// options: {reset:Boolean, transform:Path, port:Number}
module.exports = function (options) {
  if (options.reset)
    Reset();
  var name = "__otiluke__"
  var stream = new Stream.Readable();
  stream.push("global."+name+"||(global."+name+"=require("+JSON.stringify(Path.resolve(options.transform))+"));");
  stream.push(null);
  Browserify(stream).bundle(function (error, buffer) {
    if (error)
      throw error;
    var setup = buffer.toString("utf8");
    function transform (url, js) { return "eval("+name+"("+JSON.stringify(js)+","+JSON.stringify(url)+"))" }
    Proxy(options.port, function (url, type) {
      if (type.indexOf("javascript") !== -1)
        return transform.bind(null, url);
      if (type.indexOf("html") !== -1)
        return function (html) {
          return "<script>" + setup + "</script>" + html.replace(regexes.script, function (match, p1, p2, p3, offset) {
            return (regexes.external.test(p1)) ? match : p1 + transform(url+"#"+offset, p2) + p3;
          });
        };
    });
  });
  
};

var regexes = {
  script: /(<script[^>]*>)([\s\S]*?)(<\/script>)/gi,
  external: /^<script[\s\S]*?src[\s]*?=[\s\S]*?>$/i
};
