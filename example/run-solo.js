var Path = require("path");
var Fs = require("fs");
var OtilukeSolo = require("otiluke/solo");
var splitter = Math.random().toString(36).substring(2);
OtilukeSolo({
  hijack: Hijack(splitter),
  sphere: {
    path: Path.join(__dirname, "sphere.js"),
    argument: splitter
  }
}, function (instrument) {
  var path = Path.join(__dirname, "standalone", "fibo.js");
  global.eval(instrument(Fs.readFileSync(path, "utf8"), path));
});