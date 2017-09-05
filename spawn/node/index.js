var Http = require("http");
var Path = require("path");
var ChildProcess = require("child_process");
var Once = require("../once.js");

module.exports = function (receptor, vpath) {
  return function (parameter, source, script, callback) {
    var port = "/tmp/otiluke-spawn-node-"+Math.random().toString(36).substring(2)+".sock";
    (process.platform.indexOf("win") === 0) && (port = 0);
    var child = ChildProcess.fork(Path.join(__dirname, "client.js"), [], {
      stdio: ["pipe", "pipe", "pipe", "ipc"],
      encoding: "utf8"
    });
    var server = Http.createServer();
    receptor.attach(server);
    child.on("close", server.close.bind(server));
    server.listen(port, function () {
      child.send({
        port: port || server.address().port,
        vpath: Path.resolve(vpath),
        autoclose: Boolean(callback),
        parameter: parameter,
        source: source && Path.resolve(source),
        script: script
      });
    });
    if (!callback)
      return child;
    var zero = process.hrtime();
    var stdout = "";
    var stderr = "";
    child.stdout.on("data", function (data) { stdout += data });
    child.stderr.on("data", function (data) { stderr += data });
    var ocallback = Once(callback);
    child.on("error", ocallback);
    child.on("exit", function () {
      var time = process.hrtime(zero);
      ocallback(null, {
        time: (1e9 * time[0] + time[1]) / 1e6,
        stdout: stdout,
        stderr: stderr
      });
    });
  };
};
