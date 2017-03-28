
var Path = require("path");
var Http = require("http");
var ChildProcess = require("child_process");

module.exports = function (options, callback) {
  var server = Http.createServer();
  server.listen(options.socket, function () {
    var args = [__dirname+"/launch.js", options.sphere, options.socket].concat(options.target.split(/\s+/));
    var time = process.hrtime();
    var child = ChildProcess.spawn("node", args, {stdio:["pipe", "pipe", "pipe", "ipc"]});
    var channel = options.channel({sphere:options.sphere, target:options.target, send:child.send.bind(child)});
    if (channel.onmessage)
      child.on("message", channel.onmessage);
    if (channel.onrequest)
      server.on("request", channel.onrequest);
    child.on("disconnect", function () {
      server.removeAllListeners("request");
      channel.onclose();
    });
    child.on("exit", function (code) { server.close() });
    callback(child);
  });
};
