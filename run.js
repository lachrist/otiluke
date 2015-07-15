#!/usr/bin/env node

var args = require("minimist")(process.argv.slice(2));

if ("help" in args)
  console.log([
      "Otiluke is forward proxy for intercepting every bit of JavaScript code",
      "initially present in html pages and added later through script tags.",
      "Recognized arguments:",
      "  --namespace:  identifier of a global object that should contain an",
      "                eval function and where otiluke set a property 'otiluke'.",
      "  --initialize: path to JavaScript file to be executed first in the page.",
      "  --port:       port to listen for http(s) requests.",
      "  --help:       prints this message.",
      "",
      "otiluke --namespace  __hidden__ --initialize /path/to/init.js --port 8080",
    ].join("\n"));

var initialize = args.initialize ? require("fs").readFileSync(args.initialize) : null;

(require("./main.js"))(args.namespace, initialize, args.port);
