#!/usr/bin/env node
const Index = require("./index.js");
const Http = require("http");
const Minimist = require("minimist");
const options = Minimist(process.argv.slice(2));
options.handlers = {
  failure: (location, hostname, message) => {
    console.error(location + " (" + hostname+ ") >> " + message);
  }
};
Index(options.vpath, options).listen(options.port, function () {
  console.log("MITM proxy listening on: "+JSON.stringify(this.address()));
});