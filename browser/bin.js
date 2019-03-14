#!/usr/bin/env node
const Index = require("./index.js");
const Http = require("http");
const Minimist = require("minimist");
const options = Minimist(process.argv.slice(2));
options.onfailure = (location, hostname, message) => {
  console.error(location + " (" + hostname+ ") >> " + message);
};
if ("intercept" in options) options.intercept = require(options.intercept);
Index(options.vpath, options).listen(options.port, function () {
  console.log("MITM proxy listening on: "+JSON.stringify(this.address()));
});