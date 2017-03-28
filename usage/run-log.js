
var Otiluke = require("otiluke");
var Readline = require("readline");

function log (x) { process.stdout.write(x+"\n") }

// {sphere:string, target:string, send:function}
function channel (options) {
  var info = " ["+options.target+"] compiled by ["+options.sphere+"]";
  log("BEGIN "+info);
  return {
    onclose: function () { log("END "+info) }, 
    onmessage: function (data) { log(data) },
    onrequest: function (req, res) { },
  };
};

switch (process.argv[2]) {
  case "--node":
    var options = {
      sphere: __dirname+"/log.js",
      target: __dirname+"/node/circle.js 123",
      channel: channel
    };
    var callback = function (child) {
      var stdouts = [];
      var stderrs = [];
      child.stdout.on("data", function (buffer) { stdouts.push(buffer) });
      child.stderr.on("data", function (buffer) { stderrs.push(buffer) });
      child.on("exit", function (code, signal) {
        log("Close with code: "+code+ " and signal: "+signal);
        log("stdout:\n"+Buffer.concat(stdouts).toString("utf8"));
        log("stderr:\n"+Buffer.concat(stderrs).toString("utf8"));
      });
      var readline = Readline.createInterface({input:process.stdin, output:process.stdout});
      readline.question("Press <enter> to disconnect the child process and let it exit gracefully...\n", function () {
        child.disconnect();
        readline.close();
      });
    };
    Otiluke.node(options, callback);
    break;
  case "--test":
    Otiluke.test({
      sphere: __dirname+"/log.js",
      targets: __dirname+"/standalone",
      channel: channel,
      port: 8080
    });
    break;
  case "--demo":
    Otiluke.demo({
      sphere: __dirname+"/log.js",
      targets: __dirname+"/standalone",
      out: __dirname+"/demo.html"
    });
    break;
  case "--mitm":
}
