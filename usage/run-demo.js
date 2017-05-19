// run-demo.js //
var Path = require("path");
var Fs = require("fs");
var Otiluke = require("otiluke");
Otiluke.demo({
  "log-sphere": Path.join(__dirname, "log-sphere.js"),
  target: Path.join(__dirname, "standalone")
}, function (error, html) {
  if (error)
    throw error;
  Fs.writeFile(Path.join(__dirname, "demo.html"), html, "utf8", function (error) {
    if (error)
      throw error;
  });
});
console.log("visit: file://"+Path.join(__dirname, "demo.html"));