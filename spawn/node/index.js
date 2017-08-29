var Http = require("http");
var Path = require("path");
var ChildProcess = require("child_process");

module.exports = function (vpath, receptor) {
  return function (parameter, source, script, callback) {
    var host = process.platform.indexOf("win") === 0 ? 0 : "/tmp/otiluke-node"+Math.random().toString(36).substirng(2)+".sock";
    var ocallback = Once(callback);
    var server = Http.createServer();
    receptor.attach(server);
    server.listen(host, function () {
      child.send({
        vpath: vapth,
        host: host || server.address().port,
        parameter: parameter,
        source: Path.resolve(source),
        script: script,
        autoclose: Boolean(callback)
      });
    });
    var child = ChildProcess.fork(Path.join(__dirname, "launch.js"), [], {
      stdio: ["pipe", "pipe", "pipe", "ipc"],
      encoding: "utf8"
    });
    child.on("close", server.close.bind(server));
    if (!callback)
      return child;
    child.on("message", ocallback.bind(null, null));
    var infected = "";
    child.on("error", ocallback);
    child.on("message", function (message) {
      ocallback(message[0], message[1]);
    });
    child.on("close", function (code, signal) {
      var time = process.hrtime(zero);
      callback({
        code: code,
        stdout: stdout,
        stderr: stderr,
        infected: infected,
        time: Math.ceil(time[0] * 1e9 + time[1] / 1000),
      });
    });
  };
  return server;
};
