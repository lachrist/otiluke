// node launch.js {port:8080,main:"main.js",virus:"virus.js",argument:null}
var Fs = require("fs");
var EmitterNode = require("antena/emitter/node");
process.on("message", function (message) {
  var Virus = require(message.vpath);
  Virus(message.parameter, EmitterNode(message.port, false), function (error, infect) {
    if (error)
      throw error;
    global.eval(infect(message.source, message.script || Fs.readFileSync(message.source, "utf8")));
    message.autoclose && setTimeout(process.exit.bind(process), 100, 0);
  });
});