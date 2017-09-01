
// otiluke --test [--parallel] --virus path/to/virus.js [--receptor path/to/receptor.js] [--receptor-logger path/to/log.txt] --source path/to/source[.js] --parameter foo

var Fs = require("fs");
var Path = require("path");
var Chalk = require("chalk");
var OtilukeSpawnNode = require("./index.js");

function summary (benchmarks) {
  if (!failures.length)
    return console.log(Chalk.green("\n\n\nNo failures, yay!"));
  console.log(Chalk.red("\n\n\nFailures: ["+failures.length+"/"+total+"]\n"+failures.join("\n")));
}

module.exports = function (vpath, receptor, parameter, sources, parallel) {
  if (!sources.length)
    finish(0, []);
  var spawn = OtilukeSpawnNode(vpath, receptor);
  var benchmarks = [];
  function run (source, index) {
    console.log(Chalk.underline(Chalk.bold(Chalk.blue("Begin "+source+" ["+(index+1)+"/"+sources.length+"]"))));
    var zero = process.hrtime();
    spawn(parameter, source, null, function (error, result) {
      var time = process.hrtime(zero);
      var benchmark = {
        source: source,
        time: Math.ceil((1e9 * time[0] + time[1]) / 1000),
        result: result,
        error: error instanceof Error ? error.message : error
      };
      console.log(Chalk.underline(Chalk.bold(Chalk.blue("End "+source+" ["+(index+1)+"/"+sources.length+"] "+time))));
      if (error)
        return console.log(Chalk.red(error.stack || JSON.stringify(error, null, 2)));
      console.log(Chalk.green(JSON.stringify(result, null, 2)));
      done(index);
    });
  }
  if (parallel) {
    var counter = sources.length;
    var done = function () {
      (--counter) || summary(benchmarks);
    }
    sources.forEach(run);
  } else {
    var done = function (index) {
      if (index+1 === sources.length)
        return summary(benchmarks);
      run(sources[index+1], index+1);
    }
    done(-1);
  }
};
