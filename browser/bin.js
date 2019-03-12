#!/usr/bin/env node
const Index = require("./index.js");
const Http = require("http");
const Minimist = require("minimist");
const options = Minimist(process.argv.slice(2));
Index(options.vpath, options).listen(options.port, function () {
  console.log("MITM proxy listening on: "+JSON.stringify(this.address()));
});