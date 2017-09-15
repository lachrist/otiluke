// node child.js vpath parameter source 
var Fs = require("fs");

process.on("message", function (message) {
  process.removeAllListeners("message");
  process.argv[1] = message.source.path;
  var Virus = require(message.vpath);
  Virus(message.parameter, process.emitter, function (error, infect) {
    if (error)
      throw error;
    global.eval(infect(message.source.path, message.source.content || Fs.readFileSync(message.source.path, "utf8")));
  });
});
