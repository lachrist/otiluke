#!/usr/bin/env node

var Fs = require("fs");
var Path = require("path");
var Minimist = require("minimist");
var Receptor = require("antena/receptor/node");

var SpawnNode = require("./spawn/node");
var SpawnMock = require("./spawn/mock/node");
var Batch = require("./spawn/util/batch.js");
var BrowserBundle = require("./spawn/browser/bundle.js");
var ServerBrowser = require("./server/browser");
var ServerNode = require("./server/node");
var DemoBundle = require("./demo/bundle.js");

var options = Minimist(process.argv.slice(2));

function receptorof (path) {
  return path ? require(Path.resolve(path)) : Receptor({
    onrequest: function (method, path, headers, body, callback) {
      console.log(method+" "+path+" "+JSON.stringify(headers)+" "+body);
      callback(200, "ok", {}, "");
    },
    onconnect: function (path, con) {
      con.on("message", function (message) {
        console.log(path+" >> "+message);
      });
    }
  });
}

function collect (path) {
  if (/\.js$/.test(path))
    return [path];
  return Fs.readdirSync(path).filter(RegExp.prototype.test.bind(/\.js$/)).map(function (name) {
    return Path.join(path, name);
  });
};

if ("server" in options) {
  OtilukeServerNode(receptorof(options.receptor), options.virus).listen(options.port);
} else if ("client" in options) {
  process.argv = options._.slice(1, 1);
  OtilukeServerNodeClient(options.port, options.parameter, process.argv[1]);
} else if ("proxy" in options) {
  OtilukeServerBrowser(receptorof(options.receptor), options.virus, {
    namespace: options.namespace,
    splitter: options.splitter,
    key: options.key
  }).listen(options.port);
} else if ("batch" in options) {
  var receptor = receptorof(options.receptor);
  var spawn = "mock" in options ? SpawnMock(receptor, require(Path.resolve(options.virus))) : SpawnNode(receptor, options.virus);
  Batch(spawn, options.parameter, collect(options.source), options.parallel);
} else if ("bundle-client" in options) {
  BrowserBundle(options.virus, function (error, bundle) {
    if (error)
      throw error;
    process.stdout.write(bundle);
  });
} else if ("bundle-demo" in options) {
  DemoBundle(options.receptor, options.virus, function (error, page) {
    if (error)
      throw error;
    process.stdout.write(page);
  });
}
