#!/usr/bin/env node
const Index = require("./index.js");
const http = require("http");
const Minimist = require("minimist");
const options = Minimist(process.argv.slice(2));
if ("initialize" in options) {
  Index.initialize(options);
} else {
  const proxy = Http.createServer();
  const listeners = Index.listeners(options.vpath, options);
  proxy.on("connect", listeners.connect);
  proxy.on("request", listeners.request);
  proxy.listen(options.port, () => {
    console.log("MITM proxy listening on: "+JSON.stringify(proxy.address()));
  });
}