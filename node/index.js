
var ChildProcess = require("child_process");
var Children = require("../util/children.js");
var Path = require("path");

// options : {
//   comps: [
//     "path/to/comp1.js",
//     "path/to/comp2.js",
//   ],
//   channel: function (transpile, main) {
//     return {
//       onrequest: function (req, res) { ... },
//       onsocket: function (socket) { ... },
//   },
//   mains: [
//     "path/to/main1.js foo1 bar1 buz1",
//     "path/to/main2.js foo2 bar2 buz2"
//   ]
// }

module.exports = function (options, callback) {
  var experiments = [];
  function loop (i) {
    if (i === options.comps.length * options.mains.length)
      return callback(experiments);
    var comp = options.comps[Math.floor(i/options.comps.length)];
    var main = options.mains[i%options.comps.length];
    var channel = options.channel(comp, main);
    var server = Http.createServer(channel.onrequest);
    server.listen(0, function () {
      var command = "node "+__dirname+"/launch.js "+comps+" "+server.address().port+" "+main;
      var time = process.hrtime();
      channel.onsocket(ChildProcess.exec(command, function (error, stdout, stderr) {
        time = process.hrtime(time);
        server.close();
        experiments.push({
          comp: comp,
          main: main,
          time: Math.ceil((time[0]*1e9+time[1])/1000),
          error: error,
          stdout: stdout,
          stderr: stderr
        });
        loop(i+1);
      }));
    });
  }
  loop(0);
};
