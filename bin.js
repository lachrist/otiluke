#!/usr/bin/env node

if (!/^--/.test(process.argv[2])) {
  require("./node/launch.js");
} else {
  var Path = require("path");
  var Minimist = require("minimist");
  var options = Minimist(process.argv.slice(3));
  var tool = process.argv[2].substring(2);
  var usage = function (msg) {
    process.stderr.write(msg+"\n");
    process.exit(1);
  }

  if ()

  if (!options.sphere)
    usage("Every Otiluke tools expects a path to a sphere module for the --sphere argument.");
  options.sphere = {
    path: options.sphere,
    argument: options["sphere-argument"]
  };
  if (options.intercept)
    options.intercept = require(Path.resolve(options.intercept))(options["intercept-argument"]);
  if (tool === "test") {
    if (!options.target)
      usage("Otiluke/test expects a path to a standalone script for the --target argument.");
    require("./test")(options);
  } else if (tool === "html" || tool === "node" || tool === "eval") {
    require("./"+tool)(options).listen(options.port, function () {
      process.stdout.write("Otiluke server listening at "+this.address().port+"\n");
    });
  } else {
    usage("Unknown tool: "+tool);
  }
}