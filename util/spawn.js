var ChildProcess = require("child_process");
var Signal = require("./signal.js");

function message (cmd, args, code, stderr) {
  process.stderr.write(cmd+" "+args.join(" ")+" returned "+code+":\n"+stderr+"\n\n");
}

exports.async = function (cmd, args, callback) {
  var stderr = "";
  var child = ChildProcess.spawn(cmd, args, {stdio:["ignore", "ignore", "pipe"], encoding:"utf8"})
  child.stderr.on("data", function (data) { stderr += data });
  child.on("error", Signal(cmd+" "+args.join(" ")));
  child.on("close", function (code) {
    (code === 0) || message(cmd, args, code, stderr);
    callback(code)
  });
};

exports.sync = function (cmd, args) {
  var result = ChildProcess.spawnSync(cmd, args, {encoding:"utf8"});
  (result.error) && Signal(cmd+" "+args.join(" "))(result.error);
  (result.status === 0) || message(cmd, args, result.status, result.stderr);
  return result.status;
};
