#!/usr/bin/env node

var Fs = require("fs");
var Stream = require("stream");
var Minimist = require("minimist");
var ReceptorLogger = require("antena/receptor/logger");
var OtilukeTestBin = require("./test/bin.js");
var OtilukeNode = require("./node");
var OtilukeBrowser = require("./browser");

var options = Minimist(process.argv.slice(2));

function receptor (options) {
  if ("receptor" in options)
    return require(options.receptor);
  if (!options["receptor-logger"]) {
    var stream = new Stream.Writable({
      write: function (chunk, encoding, callback) {
        callback();
      }
    });
  } else if (options["receptor-logger"] === "&1") {
    var stream = process.stdout;
  } else if (options["receptor-logger"] === "&2") {
    var stream = process.stderr;
  } else {
    var stream = Fs.createWriteStream(options["receptor-logger"]);
  }
  return ReceptorLogger(stream);
}

if ("test" in options) {
  OtilukeTestBin(options.virus, receptor(options), options);
} else if ("node" in options) {
  OtilukeNode(options.virus, receptor(options)).listen(options.port);
} else if ("browser" in options) {
  OtilukeBrowser(options.virus, receptor(options), {
    namespace: options.namespace,
    splitter: options.splitter,
    key: options.key
  }).listen(options.port);
} else if ("webworker" in options) {
  OtilukeWebworkerBundle(options.virus, function (error, bundle) {
    if (error)
      throw error;
    process.stdout.write(bundle);
  });
}

//   
//   var otiluke = OtilukeTest(vpath, "receptor" in options ? require(options.receptor) : ReceptorLogger(options.log ? Fs.createWriteStream(options.log) : ignore));


// if (!/^--/.test(process.argv[2])) {
//   require("./node/launch.js");
// } else {
//   var Path = require("path");
//   var Minimist = require("minimist");
//   var options = Minimist(process.argv.slice(3));
//   var tool = process.argv[2].substring(2);
//   var usage = function (msg) {
//     process.stderr.write(msg+"\n");
//     process.exit(1);
//   }

//   if ()

//   if (!options.sphere)
//     usage("Every Otiluke tools expects a path to a sphere module for the --sphere argument.");
//   options.sphere = {
//     path: options.sphere,
//     argument: options["sphere-argument"]
//   };
//   if (options.intercept)
//     options.intercept = require(Path.resolve(options.intercept))(options["intercept-argument"]);
//   if (tool === "test") {
//     if (!options.target)
//       usage("Otiluke/test expects a path to a standalone script for the --target argument.");
//     require("./test")(options);
//   } else if (tool === "html" || tool === "node" || tool === "eval") {
//     require("./"+tool)(options).listen(options.port, function () {
//       process.stdout.write("Otiluke server listening at "+this.address().port+"\n");
//     });
//   } else {
//     usage("Unknown tool: "+tool);
//   }
// }