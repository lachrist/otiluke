
var Path = require("path");
var Http = require("http");
var ChildProcess = require("child_process");

module.exports = function (options, callback) {
  var experiments = [];
  function loop (i) {
    if (i === options.spheres.length * options.targets.length)
      return callback(experiments);
    var sphere = options.spheres[Math.floor(i/options.targets.length)];
    var target = options.targets[i%options.targets.length];
    var buffer = [];
    var server = Http.createServer();
    server.listen(0, function () {
      var args = [__dirname+"/launch.js", sphere, server.address().port].concat(target.split(/\s+/));
      var time = process.hrtime();
      var child = ChildProcess.spawn("node", args, {stdio:["ignore", "pipe", "pipe", "ipc"]});
      var channel = options.channel({sphere:sphere, target:target, send:child.send.bind(child)});
      if (channel.onmessage)
        child.on("message", channel.onmessage);
      if (channel.onrequest)
        server.on("request", channel.onrequest);
      var stdouts = [];
      var stderrs = [];
      child.stdout.on("data", function (buffer) { stdouts.push(buffer) });
      child.stderr.on("data", function (buffer) { stderrs.push(buffer) });
      child.on("close", function (code) {
        time = process.hrtime(time);
        server.close();
        channel.onclose();
        experiments.push({
          sphere: sphere,
          target: target,
          time: Math.ceil((time[0]*1e9+time[1])/1000),
          code: code,
          stdout: Buffer.concat(stdouts).toString("utf8"),
          stderr: Buffer.concat(stderrs).toString("utf8")
        });
        loop(i+1);
      });
    });
  }
  loop(0);
};
