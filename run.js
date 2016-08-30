#!/usr/bin/env node

var Otiluke = require("./main.js");
var Minimist = require("minimist");

var argv = Minimist(process.argv.slice(2));
["transpile", "namespace", "main", "port", "out", "log"].forEach(function (key) {
  argv[key] = argv[key] || argv[key[0]];
});
argv.namespace = argv.namespace || "Otiluke";

if ("demo" in argv)
  Otiluke.demo(argv);
else if ("node" in argv)
  Otiluke.node(argv);
else if ("test" in argv)
  Otiluke.test(argv);
else if ("mitm" in argv)
  Otiluke.mitm(argv);
else
  process.stdout.write([
    "Otiluke is a toolbox for developping JavaScript source-to-source compilers a.k.a. transpilers.",
    "Usage examples below, more information at: https://github.com/lachrist/otiluke.",
    "  otiluke --demo --transpile /path/to/transpile[.js] --main /path/to/main[.js] --out /path/to/demo.html",
    "  otiluke --node --transpile /path/to/transpile[.js] --main /path/to/main[.js] --log /path/to/log[.txt]",
    "  otiluke --test --transpile /path/to/transpile[.js] --port 8080               --log /path/to/log[.txt]",
    "  otiluke --mitm --transpile /path/to/transpile.js   --port 8080               --log /path/to/log[.txt] --reset"
  ].join("\n")+"\n");