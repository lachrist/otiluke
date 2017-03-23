
var Fs = require("fs");
var Path = require("path");
var Stream = require("stream");
var Resolve = require("resolve");
var Browserify = require("browserify");
var Icon = require("../util/icon.js");
var Collect = require("../util/collect.js");
var Assume = require("../util/assume.js");
var Bind = require("../util/bind.js");

// options : {
//   comps: [
//     "path/to/comp1.js",
//     "path/to/comp2.js",
//   ],
//   mains: [
//     "path/to/main1.js foo1 bar1 buz1",
//     "path/to/main2.js foo2 bar2 buz2"
//   ],
//   out: "/path/to/demo.html"
// }
module.exports = function (options) {
  var browserify = (function (readable) {
    readable.push("var MAINS = "+JSON.stringify(Collect(options.mains, null, 2)+"\n");
    readable.push("var COMPS = "+JSON.stringify(Collect(options.comps, null, 2)+"\n"));
    readable.push(Fs.readFileSync(__dirname+"/template.js", "utf8"));
    readable.push(null);
    return Browserify(readable, {basedir:__dirname});
  } (new Stream.Readable()));
  options.comps.forEach(function (comp) {
    Fs.readFileSync(comp, "utf8").replace(/[^a-zA-Z_$]require\s*\(\s*((\"[^"]*\")|(\'[^']*\'))\s*\)/g, function (_, dependency) {
      // Tried to remove the dependency with Resolve without success:
      // Source: https://github.com/nodejs/node/blob/v5.10.0/lib/module.js
      //         https://github.com/nodejs/node/blob/v5.10.0/lib/internal/module.js
      // require("module")._resolveFilename(module, {paths:[basedir]})
      // Remark: used eval instead of JSON.parse to handle single quoted strings
      browserify.require(Resolve.sync(global.eval(dependency), {basedir:Path.dirname(comp)}), {expose:global.eval(dependency)});
    });
  });
  (function (basedir) {
    c
    for (var comp in transpiles) {
      transpiles[key].replace(/[^a-zA-Z_$]require\s*\(\s*((\"[^"]*\")|(\'[^']*\'))\s*\)/g, function (_, dependency) {
        // Tried to remove the dependency with Resolve without success:
        // Source: https://github.com/nodejs/node/blob/v5.10.0/lib/module.js
        //         https://github.com/nodejs/node/blob/v5.10.0/lib/internal/module.js
        // require("module")._resolveFilename(module, {paths:[basedir]})
        // Remark: used eval instead of JSON.parse to handle single quoted strings
        browserify.require(Resolve.sync(global.eval(dependency), {basedir:basedir}), {expose:global.eval(dependency)});
      });
    }
  } (/\.js$/.test(options.transpile) ? Path.dirname(options.transpile) : options.transpile));
  browserify.bundle(function (error, bundle) {
    if (error)
      throw error;
    var output = Fs.readFileSync(__dirname+"/template.html", "utf8").replace("@ICON", Icon).replace("@TITLE", "Demo").replace("@BUNDLE", function () { return bundle.toString("utf8") });
    options.out ? Fs.writeFileSync(options.out, output, "utf8") : process.stdout.write(output);
  });
};
