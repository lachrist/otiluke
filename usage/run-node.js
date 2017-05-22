var Path = require("path");
var Otiluke = require("otiluke");
var Hijack = require("./hijack.js");
var splitter = Math.random().toString(36).substring(2);
Otiluke.node.server(Hijack(splitter)).listen(8080);
var argv = Otiluke.node.argv({
  path: Path.join(__dirname, "sphere.js"),
  argument: splitter
}, 8080);
function escape (arg) { return "'"+arg.replace("'", "'''")+"'" };
var main = Path.join(__dirname, "node", "yo.js");
console.log("run: node "+argv.map(escape).join(" ")+" "+main+" 2");