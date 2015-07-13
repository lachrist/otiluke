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
      "  --http-port:  port to listen for http requests.",
      "  --ssl-port:   port to listen for ssl-encrypted http requests.",
      "  --help:       prints this message.",
      "",
      "Example:",
      "otiluke",
      "  --namespace  __hidden__",
      "  --initialize /path/to/init.js",
      "  --http-port  8080",
      "  --ssl-port   8443"
    ].join("\n"));

(require("./main.js"))(
  args.namespace,
  args.initialize ? require("fs").readFileSync(args.initialize) : null,
  {http:args["http-port"], ssl:args["ssl-port"]}
);
