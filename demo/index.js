
var Fs = require("fs");
var Path = require("path");
var Stream = require("stream");
var Browserify = require("browserify");
var Icon = require("../util/icon.js");
var Collect = require("../util/collect.js");
var Bind = require("../util/bind.js");

module.exports = function (options, callback) {
  Collect(options["log-sphere"], function (error, lspheres) {
    if (error)
      return callback(error);
    Collect(options.target, function (error, targets) {
      if (error)
        return callback(error);
      Fs.readFile(Path.join(__dirname, "template.js"), "utf8", function (error, js) {
        if (error)
          return callback(error);
        Fs.readFile(Path.join(__dirname, "template.html"), "utf8", function (error, html) {
          if (error)
            return callback(error);
          Icon(function (error, icon) {
            if (error)
              return callback(error);            
            var readable = new Stream.Readable();
            readable.push(Bind.js(js, {
              "TARGETS": JSON.stringify(targets),
              "LOG_SPHERES": JSON.stringify(lspheres)
            }));
            readable.push(null);
            var browserify = Browserify(readable, {basedir:__dirname});
            Object.keys(lspheres).forEach(function (key) {
              lspheres[key].replace(/[^a-zA-Z_$]require\s*\(\s*((\"[^"]*\")|(\'[^']*\'))\s*\)/g, function (match, name) {
                browserify.require(Resolve.sync(global.eval(name)), {basedir:options["log-sphere"]});
              });
            });
            browserify.bundle(function (error, buffer) {
              callback(error, error || Bind.html(html, {
                ICON: icon,
                BUNDLE: "<script>"+buffer.toString("utf8").replace("</script>", "<\\/script>")+"</script>"
              }));
            });
          });
        });
      });
    });
  });
};

