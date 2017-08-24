// node launch.js {host:8080,main:"main.js",virus:"virus.js",argument:null}
var Fs = require("fs");
var EmitterNode = require("antena/emitter/node");
var options = JSON.parse(process.argv[2]);
var Virus = require(options.virus);
Virus(options.parameter, EmitterNode(options.host, false, ""), function (infect) {
  global.eval(infect(Fs.readFileSync(options.main, "utf8"), options.main));
});