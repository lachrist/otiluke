#!/usr/bin/env node

var Fs = require("fs");
var Path = require("path");
var Minimist = require("minimist");
var ReceptorLogger = require("antena/receptor/logger");
var OtilukeSpawnNodeBenchmark = require("./spawn/node/benchmark.js");
var OtilukeSpawnBrowserBundle = require("./spawn/browser/bundle.js");
var OtilukeSpawnMock = require("./spawn/mock");
var OtilukeServerBrowser = require("./server/browser");
var OtilukeServerNode = require("./server/node");

var options = Minimist(process.argv.slice(2));
var receptor = "receptor" in options ? require(Path.resolve(options.receptor)) : ReceptorLogger(process.stdout);
function collect (path) {
  if (/\.js$/.test(path))
    return [path];
  return Fs.readdirSync(path).filter(RegExp.prototype.test.bind(/\.js$/)).map(function (name) {
    return Path.join(path, name);
  });
};

if ("benchmark" in options) {
  OtilukeSpawnNodeBenchmark(options.virus, receptor, options.parameter, collect(options.source), options.parallel);
} else if ("bundle" in options) {
  OtilukeSpawnBrowserBundle(options.virus, function (error, bundle) {
    if (error)
      throw error;
    process.stdout.write(bundle);
  });
} else if ("server" in options) {
  OtilukeServerNode(options.virus, receptor).listen(options.port);
} else if ("client" in options) {
  process.argv = options._.slice(1, 1);
  OtilukeServerNodeClient(options.port, options.parameter, process.argv[1]);
} else if ("proxy" in options) {
  OtilukeServerBrowser(options.virus, receptor, {
    namespace: options.namespace,
    splitter: options.splitter,
    key: options.key
  }).listen(options.port);
} else if ("local" in options) {
  var spawn = OtilukeSpawnLocal(require(Path.resolve(options.virus)), receptor);
  collect(options.source).forEach(function (source) {
    spawn(options.paremeter, source, null, function (error, result) {
      console.log(source, error, result);
    });
  });
}