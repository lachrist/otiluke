
var Mitm = require("./mitm");
var Browserify = require("browserify");
var Fs = require("fs");
var Stream = require("stream");

var regexes = {
  script: /(<script[^>]*>)([\s\S]*?)(<\/script>)/gi,
  external: /^<script[\s\S]*?src[\s]*?=[\s\S]*?>$/i
}

function transparent (chunk, encoding, callback) {
  this.push(chunk);
  callback();
}

var standards = [
  "assert",
  "buffer",
  "child_process",
  "cluster",
  "console",
  "crypto",
  "dns",
  "domain",
  "events",
  "fs",
  "http",
  "https",
  "net",
  "os",
  "path",
  "process",
  "punycode",
  "querystring",
  "readline",
  "repl",
  "stream",
  "string_decoder",
  "tls",
  "tty",
  "dgram",
  "url",
  "util",
  "vm",
  "zlib"
];

// options: {setup:String, intercept:Function, port:Number, main:Path}
module.exports = function (options) {
  if (options.port)
    return Mitm(options.port, function (url, type) {
      if (type.indexOf("javascript") !== -1)
        return options.intercept(url);
      if (type.indexOf("html") !== -1)
        return function (html) {
          return "<script>" + options.setup + "</script>"
            + html.replace(regexes.script, function (match, p1, p2, p3, offset) {
              if (regexes.external.test(p1))
                return match;
              var transform = options.intercept(url+"#"+offset);
              return transform ? p1 + transform(p2) + p3 : match;
            });
        };
    });
  if (options.main)
    return process.stdoud.write(options.setup, function () {
      var browserify = Browserify({detectGlobals:false});
      standards.forEach(browserify.exclude.bind(browserify));
      browserify.transform(function (file) {
        var transform = options.intercept("file://"+file);
        if (!transform)
          return new Stream.Transform({transform:transparent});
        var data = "";
        return new Stream.Transform({
          transform: function (chunk, encoding, callback) {
            data += chunk;
            callback();
          },
          flush: function (callback) { callback
            this.push(transform(data));
            callback();
          }
        });
      }, {global:true});
      browserify.add(options.main).bundle().pipe(process.stdout);
    });
};
