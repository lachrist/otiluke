var Path = require("path");
var Fs = require("fs");
var Otiluke = require("otiluke");
Otiluke.demo({
  "log-sphere": Path.join(__dirname, "log-sphere.js"),
  target: Path.join(__dirname, "standalone")
}, function (error, html) {
  if (error)
    throw error;
  Fs.writeFileSync(Path.join(__dirname, "demo.html"), html, "utf8");
});
console.log("visit: file://"+Path.join(__dirname, "demo.html"));