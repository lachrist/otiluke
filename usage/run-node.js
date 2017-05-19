// run-node.js //
var Path = require("path");
var Otiluke = require("otiluke");
var Hijack = require("./hijack.js");
var splitter = Math.random().toString(36).substring(2);
var port = 8080;
var server = Otiluke.node.server(Hijack(splitter));
server.listen(port);
var argv = Otiluke.node.argv({
  path: Path.join(__dirname, "sphere.js"),
  argument: splitter
}, port);
function escape (arg) { return "'"+arg.replace("'", "'''")+"'" };
var main = Path.join(__dirname, "node", "cube.js");
console.log("run: node "+argv.map(escape).join(" ")+" "+main+" 2");