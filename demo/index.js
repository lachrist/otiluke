
var Fs = require("fs");
var Icon = require("../util/icon.js");
var AllJs = require("../util/alljs");
var Browserify = require("browserify");
var Path = require("path");
var Stream = require("stream");
var Module = require("module");
var Resolve = require("resolve");

var html = Fs.readFileSync(__dirname+"/template.html", "utf8").replace("@ICON", Icon);

module.exports = function (options) {
  html = html.replace("@TITLE", function () { return "Demo " + options.transform });
  if (/\.js$/.test(options.transform))
    Fs.readFile(options.transform, "utf8", assume(function (content) {
      var files = {};
      files[Path.basename(options.transform)] = content;
      bundle(Path.dirname(options.transform), files, options.out);
    }));
  else
    AllJs(options.transform, assume(function (files) {
      bundle(options.transform, files, options.out);
    }));
};

function assume (then) {
  return function (error, result) {
    if (error)
      throw error;
    then(result);
  }
}

function bundle (basedir, files, out) {
  var readable = new Stream.Readable();
  readable.push(Fs.readFileSync(__dirname+"/template.js", "utf8").replace("@TRANSFORMS", function () {
    return JSON.stringify(files);
  }));
  readable.push(null);
  var browserify = Browserify(readable, {basedir:__dirname});
  Object.keys(files).forEach(function (name) {
    function add (_, dependency) {
      dependency = JSON.parse(dependency);
      browserify.require(Resolve.sync(dependency, {basedir:basedir}), {expose:dependency});
    }
    files[name].replace(/[^a-zA-Z_$]require\s*\(\s*((\"[^"]*\")|(\'[^']*\'))\s*\)/g, add);
  });
  browserify.bundle(assume(function (bundle) {
    Fs.writeFileSync(out, html.replace("@BUNDLE", function () { return bundle.toString("utf8") }), "utf8");
  }));
}
