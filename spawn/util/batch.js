
// otiluke --test [--parallel] --virus path/to/virus.js [--receptor path/to/receptor.js] [--receptor-logger path/to/log.txt] --source path/to/source[.js] --parameter foo

var Fs = require("fs");
var Path = require("path");
var Chalk = require("chalk");
var Performance = require("./performance.js");

function isfailure (result) {
  return result.stderr.length;
}

function sourceof (result) {
  return result.source;
}

function summary (results) {
  console.log(JSON.stringify(results));
  var failures = results.filter(isfailure).map(sourceof);
  if (!failures.length)
    return console.log(Chalk.green("\n\n\nNo failures, yay!"));
  console.log(Chalk.red("\n\n\nFailures: "+failures.length+" out of "+results.length+":\n"+failures.join("\n")));
}

module.exports = function (spawn, parameter, sources, parallel) {
  if (!sources.length)
    return summary([]);
  var results = [];
  function run (source, index) {
    console.log(Chalk.underline(Chalk.bold(Chalk.blue("Begin "+source+" ["+(index+1)+"/"+sources.length+"]"))));
    var zero = Performance.now();
    spawn(parameter, source, null, function (error, result) {
      if (error)
        throw error;
      result.source = source;
      results.push(result);
      console.log(Chalk.underline(Chalk.bold(Chalk.blue("End   "+source+" ["+(index+1)+"/"+sources.length+"] "+result.time+":"))));
      result.stdout.length && console.log(Chalk.green(result.stdout));
      result.stderr.length && console.log(Chalk.red(result.stderr));
      done(index);
    });
  }
  if (parallel) {
    var counter = sources.length;
    var done = function () {
      (--counter) || summary(results);
    }
    sources.forEach(run);
  } else {
    var done = function (index) {
      if (index+1 === sources.length)
        return summary(results);
      run(sources[index+1], index+1);
    }
    done(-1);
  }
};
