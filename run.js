#!/usr/bin/env node

var Main = require("./main.js");
var Minimist = require("minimist");

var argv = Minimist(process.argv.slice(2));

if ("help" in argv) {
  process.stdout.write("otiluke --test --transform /path/to/transform.js --port 8080\n");
  process.stdout.write("otiluke --demo --transform /path/to/transform.js --out /path/to/demo.html\n");
  process.stdout.write("otiluke --node --transform /path/to/transform.js --main /path/to/main.js\n");
  process.stdout.write("otiluke --mitm --transform /path/to/transform.js --port 8080 [--reset]\n");
  process.stdout.write("N.B.:\n");
  process.stdout.write("  1. The demo's transform option can point to directory containing transform modules\n");
  process.stdout.write("  2. The mitm's reset options reset all certificates (including the selfsigned root).\n");
}

if ("test" in argv)
  Main.test(argv);
else if ("demo" in argv)
  Main.demo(argv);
else if ("node" in argv)
  Main.node(argv);
else if ("mitm" in argv)
  Main.mitm(argv);