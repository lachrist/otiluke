
var Fs = require("fs");
var Icon = require("../util/icon.js");
var AllJs = require("../util/alljs");
var Browserify = require("browserify");
var Path = require("path");
var Stream = require("stream");

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
  var dependencies = [];
  function register (_, d) { dependencies.push(JSON.parse(d)) }
  for (var name in files)
    files[name].replace(/[^a-zA-Z_$]require\s*\(\s*((\"[^"]*\")|(\'[^']*\'))\s*\)/g, register);
  var readable = new Stream.Readable();
  readable.push(Fs.readFileSync(__dirname+"/template.js", "utf8").replace("@TRANSFORMS", function () {
    return JSON.stringify(files);
  }));
  readable.push(null);
  Browserify(readable, {basedir:__dirname}).require(dependencies, {basedir:basedir}).bundle(assume(function (bundle) {
    Fs.writeFileSync(out, html.replace("@BUNDLE", function () { return bundle.toString("utf8") }), "utf8");
  }));
}
