#!/usr/bin/env node

var Otiluke = require("./main.js");
var Minimist = require("minimist");

var argv = Minimist(process.argv.slice(2));
["transpile", "main", "port", "namespace", "out", "log", "reset"].forEach(function (key) {
  argv[key] = argv[key] || argv[key[0]];
});
argv.namespace = argv.namespace || "Otiluke";
argv.port = argv.port || 0;

if ("test" in argv)
  Otiluke.test(argv);
else if ("demo" in argv)
  Otiluke.demo(argv);
else if ("node" in argv)
  Otiluke.node(argv);
else if ("mitm" in argv)
  Otiluke.mitm(argv);
else
  process.stdout.write([
    "Otiluke is a toolbox for developping JavaScript source-to-source compilers a.k.a. transpilers.",
    "Usage examples below, more information at: https://github.com/lachrist/otiluke.",
    "  otiluke --test --transpile path/to/transpile[.js] --port 8080              --namespace Otiluke --log path/to/log[.txt]",
    "  otiluke --demo --transpile path/to/transpile[.js] --main path/to/main[.js] --namespace Otiluke --out path/to/demo.html",
    "  otiluke --node --transpile path/to/transpile[.js] --main path/to/main[.js] --namespace Otiluke --log path/to/log[.txt]",
    "  otiluke --mitm --transpile path/to/transpile.js   --port 8080              --namespace Otiluke --log path/to/log[.txt] --reset"
  ].join("\n")+"\n");