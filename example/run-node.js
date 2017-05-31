var Path = require("path");
var OtilukeNode = require("otiluke/node");
var Hijack = require("./hijack.js");
var splitter = Math.random().toString(36).substring(2);
OtilukeNode({
  hijack: Hijack(splitter),
  sphere: {
    path: Path.join(__dirname, "sphere.js"),
    argument: splitter
  }
}).listen(8080);
console.log("Execute: otiluke 8080 example/node/cube.js 2");,