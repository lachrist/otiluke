
var Stream = require("stream");
var Browserify = require("browserify");
var Resolve = require("resolve");

// Tried to remove the dependency with Resolve without success:
// Source: https://github.com/nodejs/node/blob/v5.10.0/lib/module.js
//         https://github.com/nodejs/node/blob/v5.10.0/lib/internal/module.js
// require("module")._resolveFilename(module, {paths:[basedir]})
// Remark: used eval instead of JSON.parse to handle single quoted strings
module.exports = function (content, basedir, dependencies, callback) {
  var readable = new Stream.Readable();
  readable.push(content, "utf8");
  readable.push(null);
  var browserify = Browserify(readable, {basedir:basedir});
  dependencies.forEach(function (dep) {
    browserify.require(Resolve.sync(global.eval(dep.name), {basedir:dep.basedir}), {expose:dep.name});
  });
  browserify.bundle(function (error, buffer) {
    callback(error, error || buffer.toString("utf8").replace(/\<\/script\>/g, "<\\/script>"));
  });
};
