#!/usr/bin/env node

var initialize = null;
var namespace = null;
var proxy = {};
var hijack = {};

for (var i=2; i<process.argv.length; i++)
  switch (process.argv[i]) {
    case "--namespace": namespace = process.argv[i+1];
    case "--initialize": initialize = fs.readFileprocess.argv[i+1];
    case "--http-proxy": ports.http = process.argv[i+1];
    case "--ssl-proxy": ports.ssl = process.argv[i+1];
    case "--hijack-host": hijack.host = process.argv[i+1];
    case "--hijack-port": hijack.port = process.argv[i+1];
  }

(require("./main.js"))(namespace, initialize, proxy, hijack);
