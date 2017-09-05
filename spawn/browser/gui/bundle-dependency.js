
var Fs = require("fs");
var Path = require("path");
var Browserify = require("browserify");

module.exports = function (path, callback) {
  Fs.readFile(path, "utf8", function (error, content) {
    if (error)
      return callback(error);
    var modules = [];
    content.replace(/[^a-zA-Z0-9_$]require\s*\(\s*(("[^"]*")|('[^']*'))\s*\)/g, function (match, p1) {
      modules.push(eval(p1));
    });
    var browserify = Browserify({basedir:Path.dirname(path)});
    modules.forEach(browserify.require.bind(browserify));
    browserify.bundle(function (error, bundle) {
      if (error)
        return callback(error);
      callback(null, {
        initial: content,
        names: modules,
        bundle: bundle.toString("utf8")
      });
    });
  });
};
