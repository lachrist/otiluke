#!/usr/bin/env node
const Index = require("./index.js");
const http = require("http");
const Minimist = require("minimist");
const options = Minimist(process.argv.slice(2));
const proxy = Http.createServer();
const listeners = Index.listeners(options.vpath, options);
proxy.on("request", listeners.request);
proxy.on("connect", listeners.connect);
proxy.on("upgrade", listeners.upgrade);
proxy.listen(options.port, () => {
  console.log("MITM proxy listening on: "+JSON.stringify(proxy.address()));
});