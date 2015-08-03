#!/usr/bin/env node

var Minimist = require("minimist")
var Fs = require("fs");
var Main = require("./main.js")

var args = Minimist(process.argv.slice(2));
if ("help" in args)
  process.stdout.write([
      "Otiluke is a forward proxy for intercepting every bit of JavaScript code",
      "initially present in html pages and added later through script tags.",
      "Recognized arguments:",
      "  --port:        8080             port to listen for http(s) requests",
      "  --namespace:   __hidden__       safe global variable in the browser",
      "  --init-file:   /path/to/init.js path to JavaScript file to be executed first in the page",
      "  --log-level:   warning          log granularity: [nothing|error|warning|info]",
      "  --record-port: 8000             port that a CORS https server will listen to",
      "  --record-file: /path/to/out.txt path to a file where the record server will record stuff",
      "  --help:                         prints this message.",
      "",
    ].join("\n"));
Main({
  port: Number(args.port),
  namespace: args.namespace,
  init: args["init-file"] ? Fs.readFileSync(args["init-file"], {encoding:"utf8"}) : null,
  log: args["log-level"],
  record: args["record-port"] ? {port:args["record-port"], file:args["record-file"]} : null
});
