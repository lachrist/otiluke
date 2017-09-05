#!/usr/bin/env node

var Fs = require("fs");
var Path = require("path");
var Minimist = require("minimist");
var ReceptorLogger = require("antena/receptor/logger");
var OtilukeSpawnNodeBatch = require("./spawn/node/batch.js");
var OtilukeSpawnBrowserBundle = require("./spawn/browser/bundle.js");
var OtilukeServerBrowser = require("./server/browser");
var OtilukeServerNode = require("./server/node");
var OtilukeDemoBundle = require("./demo/bundle.js");

var options = Minimist(process.argv.slice(2));

function make () {
  return "receptor" in options ? require(Path.resolve(options.receptor)) : ReceptorLogger(process.stdout);
}

function collect (path) {
  if (/\.js$/.test(path))
    return [path];
  return Fs.readdirSync(path).filter(RegExp.prototype.test.bind(/\.js$/)).map(function (name) {
    return Path.join(path, name);
  });
};

if ("batch" in options) {
  OtilukeSpawnNodeBatch(options.virus, make(), options.parameter, collect(options.source), options.parallel);
} else if ("bundle" in options) {
  OtilukeSpawnBrowserBundle(options.virus, function (error, bundle) {
    if (error)
      throw error;
    process.stdout.write(bundle);
  });
} else if ("server" in options) {
  OtilukeServerNode(options.virus, make()).listen(options.port);
} else if ("client" in options) {
  process.argv = options._.slice(1, 1);
  OtilukeServerNodeClient(options.port, options.parameter, process.argv[1]);
} else if ("proxy" in options) {
  OtilukeServerBrowser(options.virus, make(), {
    namespace: options.namespace,
    splitter: options.splitter,
    key: options.key
  }).listen(options.port);
} else if ("demo" in options) {
  OtilukeDemoBundle(options.receptor, options.virus, function (error, page) {
    if (error)
      throw error;
    process.stdout.write(page);
  });
}