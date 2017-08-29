// node launch.js {port:8080,main:"main.js",virus:"virus.js",argument:null}
var Fs = require("fs");
var Minimist = require("minimist");
var EmitterNode = require("antena/emitter/node");
var options = Minimist(process.argv.slice(2));
var Virus = require(options.vpath);
Virus(options.parameter, EmitterNode(options.host, false), function (error, infect) {
  if (error)
    throw error;
  var infected = infect(options.source, options.script || Fs.readFileSync(options.source, "utf8"));
  global.eval(infected);
  process.send(infected);
  if (options.autoclose)
    process.exit(0);
});