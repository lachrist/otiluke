#!/usr/bin/env node

var fs = require("fs");

var initialize = null;
var namespace = null;
var ports = {};
var origins = null;

var args = {
  "--namespace":  function (i) { namespace = process.argv[i+1] },
  "--initialize": function (i) { initialize = fs.readFileSync(process.argv[i+1], {encoding:"utf8"}) },
  "--http-port":  function (i) { ports.http = process.argv[i+1] },
  "--ssl-port":   function (i) { ports.ssl = process.argv[i+1] },
  "--origins":    function (i) { origins = process.argv[i+1].split(/\s+/g) },
  "--help":       function () {
    console.log([
      "Otiluke is forward proxy for intercepting every bit of JavaScript code",
      "initially present in html pages and added later through script tags.",
      "Recognized arguments:",
      "  --namespace:  identifier of a global object that should contain an",
      "                eval function and where otiluke set a property 'otiluke'.",
      "  --initialize: path to JavaScript file to be executed first in the page.",
      "  --http-port:  port to listen for http requests.",
      "  --ssl-port:   port to listen for ssl-encrypted http requests.",
      "  --origins:    space-separated list of allowed cross origin urls.",
      "  --help:       prints this message.",
      "",
      "Example:",
      "otiluke",
      "  --namespace  __hidden__",
      "  --initialize /path/to/init.js",
      "  --http-port  8080",
      "  --ssl-port   8443",
      "  --origins    \"localhost:8000\""
    ].join("\n"));
  }
};

process.argv.forEach(function (arg, i) {
  if (arg in args)
    args[arg](i);
});

(require("./main.js"))(namespace, initialize, ports, origins);
