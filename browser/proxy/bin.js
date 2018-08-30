#!/usr/bin/env node
const Index = require("./index.js");
const Http = require("http");
const Minimist = require("minimist");
const options = Minimist(process.argv.slice(2));
options.handlers = {
  forgery: (hostname, server) => {
    server._otiluke_hostname = hostname;
  },
  activity: (description, origin, emitter) => {
    emitter._otiluke_description = description;
    emitter._otiluke_hostname = origin._otiluke_hostname;
    emitter.on("error", onerror);
  }
}
function onerror (error) {
  process.stderr.write(this._otiluke_description+" ("+this._otiluke_hostname+") >> "+error.message+"\n");
}
const proxy = Http.createServer();
proxy._otiluke_hostname = "__PROXY__";
const listeners = Index(options.vpath, options);
proxy.on("request", listeners.request);
proxy.on("connect", listeners.connect);
proxy.on("upgrade", listeners.upgrade);
proxy.listen(options.port, () => {
  console.log("MITM proxy listening on: "+JSON.stringify(proxy.address()));
});