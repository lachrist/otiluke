#!/usr/bin/env node

var Path = require("path");
var Otiluke = require("./main.js");
var Minimist = require("minimist");
var LogHijack = require("./subsphere/hijack/log.js");

function usage () {
  process.stderr.write([
    "Otiluke is a toolbox for developping JavaScript source-to-source compilers a.k.a. transpilers.",
    "Usage examples below, more information at: https://github.com/lachrist/otiluke.",
    "  otiluke --node --log-sphere path/to/log-sphere.js --port 8080",
    "  otiluke --mitm --log-sphere path/to/log-sphere.js --port 8080",
    "  otiluke --test --log-sphere path/to/log-sphere.js --port 8080 [--basedir path/to/basedir]",
    "  otiluke --demo --log-sphere path/to/log-sphere.js --target path/to/target[.js]"
  ].join("\n")+"\n");
};

var options = Minimist(process.argv.slice(2));

if ("log-sphere" in options) {
  if ("demo" in options && "target" in options) {
    Otiluke.demo(options, function (error, html) {
      if (error)
        throw error;
      process.stdout.write(html);
    });
  } else if ("port" in options) {
    var splitter = "otiluke"+Math.random().toString(36).substring(2);
    options.hijack = LogHijack(splitter);
    options.sphere = {
      argument: splitter,
      path: {
        sub: options["log-sphere"],
        cast: Path.join(__dirname, "subsphere", "cast", "log.js")
      }
    };
    if ("test" in options) {
      Otiluke.test(options).listen(options.port, function () {
        console.log("Serving: "+options.basedir+" on http://localhost:"+options.port);
      });
    } else if ("node" in options) {
      Otiluke.node.server(options.hijack).listen(options.port, function () {
        var argv = Otiluke.node.argv(options.sphere, options.port);
        console.log("Prepend arguments: node "+argv.map(function (s) {
          return "'"+String(s).replace("'", "'''")+"'";
        }).join(" "));
      });
    } else if ("mitm" in options) {
      Otiluke.mitm(options).listen(options.port, function () {
        console.log("Intercepting traffic on http://localhost:"+options.port);
      });
    } else {
      usage();
    }
  } else {
    usage();
  }
}
