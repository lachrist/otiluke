
var Fs = require("fs");
var Path = require("path");
var Icon = require("../util/icon.js");
var AllJs = require("../util/alljs");
var Browserify = require("browserify");
var Http = require("http");
var Stream = require("stream");

var js = Fs.readFileSync(__dirname+"/template.js", "utf8");
var html = Fs.readFileSync(__dirname+"/template.html", "utf8").replace("@ICON", Icon);

module.exports = function (options) {
  html = html.replace("@TITLE", function () { return "Test " + options.transform });
  Http.createServer(function (req, res) {
    if (req.url.endsWith(".js"))
      Fs.readFile(process.cwd()+req.url, "utf8", function (error, target) {
        error ? signal(res, 404, error.message) : perform(res, options.transform, {main:target});
      });
    else
      AllJs(process.cwd()+req.url, function (error, targets) {
        error ? signal(res, 404, error.message) : perform(res, options.transform, targets);
      });
  }).listen(options.port || 8000);
};

function signal (res, code, msg) {
  res.writeHead(code, {"Content-Type": "text/plain"});
  res.end(msg);
}

function perform (res, transform, targets) {
  var readable = new Stream.Readable();
  readable.push(js
    .replace("@TRANSFORM", function () { return JSON.stringify(Path.resolve(transform)) })
    .replace("@TARGETS", function () { return JSON.stringify(targets) }));
  readable.push(null);
  Browserify(readable, {basedir:__dirname}).bundle(function (error, bundle) {
    if (error)
      return signal(res, 400, error.message);
    res.writeHead(200, {"Content-Type":"text/html"});
    res.end(html.replace("@BUNDLE", function () {
      return bundle.toString("utf8").replace(/<\/script>/gi, function () { return "<\\/script>" });
    }));
  });
}
