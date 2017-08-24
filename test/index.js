var ChildProcess = require("child_process");
var Http = require("http");
var Handle = require("antena/receptor/handle");
var Path = require("path");

module.exports = function (vpath, receptor) {
  return function (inputs, output, callback) {
    var server = Http.createServer();
    var failures = [];
    receptor.attach(server);
    server.listen(0, function () {
      options.output.write("[");
      function loop (index) {
        if (index === inputs.length) {
          output.write("]\n");
          server.close();
          return callback();       
        }
        options.output.write("{ source: "+JSON.stringify(inputs[index].source)+",\n");
        options.output.write("  parameter: "+JSON.stringify(inputs[index].parameter)+",\n");
        var zero = process.hrtime();
        var child = ChildProcess.fork(Path.join(__dirname, "launch.js"), [JSON.stringify({
          virus: vpath,
          port: server.address().port,
          input: inputs[index]
        })], {
          stdio: ["ignore", "pipe", "pipe", "ipc"],
          encoding: "utf8"
        });
        inputs[index].stdout = "";
        inputs[index].stderr = "";
        child.stdout.on("data", function (data) { inputs[index].stdout += data });
        child.stderr.on("data", function (data) { inputs[index].stderr += data });
        child.on("close", function (code, signal) {
          inputs[index].time = process.hrtime(zero);
          inputs[index].code = code;
          inputs[index].signal = signal;
          output.write(JSON.stringify(inputs[index], null, 2));
          if (index+1 < inputs.length)
            output.write(",\n");
          loop(index+1);
        });
      }
      loop(0);
    });
  };
