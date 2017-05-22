var Path = require("path");
var Otiluke = require("otiluke");
var Hijack = require("./hijack.js");
var splitter = Math.random().toString(36).substring(2);
Otiluke.test({
  basedir: __dirname,
  hijack: Hijack(splitter),
  sphere: {
    path: Path.join(__dirname, "sphere.js"),
    argument: splitter
  }
}).listen(8080);
console.log("visit: http://localhost:8080/standalone");