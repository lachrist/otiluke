
var ChildProcess = require("child_process");
var Children = require("../util/children.js");
var Path = require("path");
var Log = require("../util/log.js");

module.exports = function (options) {
  var log = Log(options.log);
  var ts = Children(options.transpile, /\.js$/);
  var ms = Children(options.main, /\.js$/);
  var experiments = [];
  function loop (t, m) {
    (m === ms.length) && (m = 0, t++);
    if (t === ts.length)
      return process.stdout.write(JSON.stringify(experiments, null, 2)+"\n");
    process.stdout.write("Running "+Path.basename(ts[t])+" on "+Path.basename(ms[m])+"...\n");
    var time = process.hrtime();
    ChildProcess.fork(__dirname+"/launch.js", [options.namespace, ts[t], ms[m]].concat(options.arguments||[]), {stdio:"inherit"})
      .on("message", log(encodeURIComponent(Path.basename(ms[m]))+"?"+encodeURIComponent(Path.basename(ts[t]))))
      .on("error", function (error) { throw error })
      .on("exit", function (code, signal) {
        time = process.hrtime(time);
        experiments.push({
          transpile: Path.basename(ts[t]),
          main: Path.basename(ms[m]),
          time: Math.ceil((time[0]*1e9+time[1])/1000),
          code: code,
          signal: signal,
        });
        loop(t, m+1);
      });
  }
  loop(0, 0);
};
