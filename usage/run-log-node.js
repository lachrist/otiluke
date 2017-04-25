
var ChildProcess = require("child_process");
var LogServer = require("./log-server.js");
var Otiluke = require("otiluke");

var socket = __dirname+"/socket";

function run (target) {
  var args = Otiluke.node({
    path: __dirname+"/log.js",
    options: {
      target: target.join(" "),
      url: "unix://"+socket
    }
  }, target);
  var child = ChildProcess.spawn("node", args, {encoding:"utf8", stdio:"pipe"});
  var stdout = "";
  var stderr = "";
  child.stdout.on("data", function (data) { stdout += data });
  child.stderr.on("data", function (data) { stderr += data });
  child.on("exit", function (status) {
    console.log(target.join(" ")+" done: "+JSON.stringify({
      status: status,
      stdout: stdout,
      stderr: stderr
    }, null, 2));
  });
}

var server = LogServer();
server.listen(socket, function () {
  run([__dirname+"/node/circle.js", "123"]);
  run([__dirname+"/node/cube.js", "456"]);
});
process.on("SIGINT", function () {
  server.close();
});

