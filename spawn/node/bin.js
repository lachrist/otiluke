
// otiluke --test [--parallel] --virus path/to/virus.js [--receptor path/to/receptor.js] [--receptor-logger path/to/log.txt] --source path/to/source[.js] --parameter foo

var Fs = require("fs");
var Path = require("path");
var Chalk = require("chalk");
var OtilukeTest = require("./index.js");

var isjs = RegExp.prototype.test.bind(/\.js$/);

function print (result) {
  var status = result.source+" "+result.time+" "+result.code;
  console.log(Chalk[result.code ? "red" : "green"](status+"\n"+Array(status.length+1).join("=")));
  result.infected.length && console.log(Chalk.blue(result.infected));
  result.stdout.length && console.log(Chalk.green("STDOUT\n"+result.stdout));
  result.stderr.length && console.log(Chalk.red("STDERR\n"+result.stderr));
}

function bycode (r1, r2) {
  if (r1.code < r2.code)
    return -1;
  if (r1.code > r2.code)
    return 1;
  return 0;
}

function finish (server, results) {
  server.close();
  var failures = [];
  console.log(JSON.stringify(results.map(function (result) {
    if (result.code)
      failures.push(result.source);
    return {
      source: result.source,
      code: result.code,
      time: result.time
    };
  })));
  console.log("Failures "+failures.length+"/"+results.length+":\n"+failures.join("\n"));
}

module.exports = function (vpath, receptor, options) {
  var server = OtilukeTest(vpath, receptor);
  server.listen(options.host, function () {
    var results = [];
    var paths = isjs(options.source) ? [options.source] : Fs.readdirSync(options.source).filter(isjs).map(function (name) {
      return Path.join(options.source, name);
    });
    if (options.parallel) {
      return paths.forEach(function (path) {
        server.otiluke(path, null, options.parameter, function (result) {
          results.push(result);
          if (results.length === paths.length) {
            results.sort(bycode).forEach(print);
            finish(server, results);
          }
        });
      });
    }
    function loop (index) {
      if (index === paths.length)
        return finish(server, results);
      console.log(paths[index]+"["+index+"/"+paths.length+"]...");
      server.otiluke(paths[index], null, options.parameter, function (result) {
        print(result);
        results.push(result);
        loop(index+1);
      });
    }
    loop(0);
  });
};
