#!/usr/bin/env node
const Path = require("path");
const Minimist = require("minimist");
const options = Minimist(process.argv.slice(2));
if ("--ca" in options) {
  require("./reset.js")(options);
} else {
  options.virus = require(Path.resolve(options.virus));
  require("./node.js")(options);
}