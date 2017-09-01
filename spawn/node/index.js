var Http = require("http");
var Path = require("path");
var ChildProcess = require("child_process");
var Read = require("../read.js");
var Once = require("../once.js");

module.exports = function (vpath, receptor) {
  return function (parameter, source, script, callback) {
    var port = "/tmp/otiluke-spawn-node-"+Math.random().toString(36).substring(2)+".sock";
    (process.platform.indexOf("win") === 0) && (port = 0);
    var child = ChildProcess.fork(Path.join(__dirname, "client.js"), [], {
      stdio: ["inherit", "inherit", "inherit", "ipc"],
      encoding: "utf8"
    });
    var server = Http.createServer();
    receptor.attach(server);
    child.on("close", server.close.bind(server));
    server.listen(port, function () {
      child.send({ƒ
        port: port || server.address().port,
        vpath: Path.resolve(vpath),
        autoclose: Boolean(callback),
        parameter: parameter,
        source: Path.resolve(source),
        script: script
      });
    });
    if (!callback) {
      var interface = new Events();
      interface.terminate = child.kill.bind(child);
      server.on("error", interface.emit.bind(interface, "error"));
      child.on("message", function (message) {
        interface.emit("error", Read(message[0]));
      });
      child.on("close", interface.emit.bind(interface, "close"));
      return interface;
    }
    var ocallback = Once(callback);
    server.on("error", ocallback);
    child.on("error", ocallback);
    child.on("message", function (message) {
      ocallback(Read(message[0]), Read(message[1]));
      child.kill();
    });
  };
};
