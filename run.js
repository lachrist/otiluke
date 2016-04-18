#!/usr/bin/env node

var Main = require("./main.js");
var Minimist = require("minimist");

var argv = Minimist(process.argv.slice(2));

if ("help" in argv) {
  process.stdout.write("otiluke --node --transform /path/to/transform.js --main /path/to/main.js\n");
  process.stdout.write("otiluke --mitm --transform /path/to/transform.js --port 8080 [--reset]\n");
  process.stdout.write("The reset options reset all certificates (including the selfsigned root).\n")
}

if ("node" in argv)
  Main.node(argv)
else if ("mitm" in argv)
  Main.mitm(argv);
