var Path = require("path");
var OtilukeTest = require("otiluke/test");
var Hijack = require("./hijack.js");
var splitter = Math.random().toString(36).substring(2);
OtilukeTest({
  hijack: Hijack(splitter),
  sphere: {
    path: Path.join(__dirname, "sphere.js"),
    argument: splitter
  }
}).listen(8080);
console.log("Visit: http://localhost:8080/standalone");