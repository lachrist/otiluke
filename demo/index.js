
var Fs = require("fs");
var Path = require("path");
var Stream = require("stream");
var Resolve = require("resolve");
var Browserify = require("browserify");
var Icon = require("../util/icon.js");
var Collect = require("../util/collect.js");
var Assume = require("../util/assume.js");
var Bind = require("../util/bind.js");

module.exports = function (options) {
  var transpiles = Collect(options.transpile, /\.js$/);
  var mains = Collect(options.main, /\.js$/);
  var browserify = (function (readable) {
    readable.push(Bind(Fs.readFileSync(__dirname+"/template.js", "utf8"), {
      "@MAINS": JSON.stringify(mains),
      "@TRANSPILES": JSON.stringify(transpiles)
    }));
    readable.push(null);
    return Browserify(readable, {basedir:__dirname});
  } (new Stream.Readable()));
  options.transpile && (function (basedir) {
    for (var key in transpiles)
      transpiles[key].replace(/[^a-zA-Z_$]require\s*\(\s*((\"[^"]*\")|(\'[^']*\'))\s*\)/g, function (_, dependency) {
        // Tried to remove the dependency with Resolve without success:
        // Source: https://github.com/nodejs/node/blob/v5.10.0/lib/module.js
        //         https://github.com/nodejs/node/blob/v5.10.0/lib/internal/module.js
        // require("module")._resolveFilename(module, {paths:[basedir]})
        browserify.require(
          Resolve.sync(JSON.parse(dependency), {basedir:basedir}),
          {expose:JSON.parse(dependency)});
      });
  } (/\.js$/.test(options.transpile) ? Path.dirname(options.transpile) : options.transpile));
  browserify.bundle(Assume(function (bundle) {
    var output = Fs.readFileSync(__dirname+"/template.html", "utf8")
      .replace("@ICON", Icon)
      .replace("@TITLE", "Demo")
      .replace("@BUNDLE", function () { return bundle.toString("utf8") });
    options.out ? Fs.writeFileSync(options.out, output, "utf8") : process.stdout.write(output);
  }));
};
