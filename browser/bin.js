#!/usr/bin/env node
const Listeners = require("./listeners");
const Http = require("http");
const Minimist = require("minimist");
const options = Minimist(process.argv.slice(2));
options.handlers = {
  forgery: (hostname, server) => {
    server._otiluke_location = "forgery";
    server._otiluke_hostname = hostname;
    server.on("error", onerror);
    server.on("connection", onconnection)
  },
  activity: (location, origin, socket) => {
    socket._otiluke_location = location;
    socket._otiluke_hostname = origin._otiluke_hostname;
    socket.on("error", onerror);
  }
};
function onconnection (socket) {
  socket._otiluke_location = this._otiluke_location+"-socket";
  socket._otiluke_hostname = this._otiluke_hostname;
  socket.on("error", onerror);
}
function onerror (error) {
  console.error(this._otiluke_location+" ("+this._otiluke_hostname+") >> "+error.message);
}
const proxy = Http.createServer();
proxy._otiluke_location = "proxy";
proxy._otiluke_hostname = "PROXY";
proxy.on("connection", onconnection);
const listeners = Listeners(options.vpath, options);
proxy.on("request", listeners.request);
proxy.on("connect", listeners.connect);
proxy.on("upgrade", listeners.upgrade);
proxy.listen(options.port, () => {
  console.log("MITM proxy listening on: "+JSON.stringify(proxy.address()));
});