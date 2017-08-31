
// otiluke --test [--parallel] --virus path/to/virus.js [--receptor path/to/receptor.js] [--receptor-logger path/to/log.txt] --source path/to/source[.js] --parameter foo

var Fs = require("fs");
var Path = require("path");
var Chalk = require("chalk");
var OtilukeSpawnNode = require("./index.js");

function print (source, error, result, time) {
  console.log(Chalk.underline(Chalk.bold(Chalk.blue(source+" "+(time||"")))));
  if (error)
    return console.log(Chalk.red(error.stack || JSON.stringify(error, null, 2)));
  console.log(Chalk.green(JSON.stringify(result, null, 2)));
}

function finish (total, failures) {
  if (!failures.length)
    return console.log(Chalk.green("\n\n\nNo failures, yay!"));
  console.log(Chalk.red("\n\n\nFailures: ["+failures.length+"/"+total+"]\n"+failures.join("\n")));
}

module.exports = function (vpath, receptor, parameter, sources, parallel) {
  if (!sources.length)
    finish(0, []);
  var spawn = OtilukeSpawnNode(vpath, receptor);
  var failures = [];
  if (parallel) {
    var counter = sources.length;
    return sources.forEach(function (source) {
      spawn(parameter, source, null, function (error, result) {
        error && failures.push(source);
        print(source, error, result);
        (--counter) || finish(sources.length, failures);
      });
    });
  }
  function loop (index) {
    if (index === sources.length)
      return finish(sources.length, failures);
    console.log(sources[index]+"["+index+"/"+sources.length+"]...");
    var zero = process.hrtime();
    spawn(parameter, sources[index], null, function (error, result) {
      error && failures.push(sources[index]);
      var time = process.hrtime(zero);
      print(sources[index], error, result, Math.ceil((1e9 * time[0] + time[1]) / 1000));
      loop(index+1);
    });
  }
  loop(0);
};
