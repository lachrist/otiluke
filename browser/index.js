#!/usr/bin/env node
const Listeners = require("./listeners");
const Http = require("http");

const noop = () => {};

function closeAll (callback) {
  this.close((error) => {
    if (error)
      return callback(error);
    const counter = this._otiluke_servers.size;
    if (!counter)
      return callback(null);
    const onclose = (error) => {
      if (error) {
        callback(error);
        callback = noop;
      } else if (!--counter) {
        callback(null)
      }
    };
    for (server of this._otiluke_servers) server.close(onclose);
  });
};

function destroyAll () { for (socket of this._otiluke_sockets) socket.destroy() };

const signal = (location, hostname, message) => {
  console.error(location+" >> "+hostname+" >> "+message);
};

module.exports = (vpath, options) => {
  const proxy = Http.createServer();
  proxy._otiluke_sockets = new Set();
  proxy._otiluke_servers = new Set();
  function onsocketclose () { proxy._otiluke_sockets.delete(this) }
  function onserverclose () { proxy._otiluke_servers.delete(this) }
  function onconnection (socket) {
    socket._otiluke_location = "connection";
    socket._otiluke_hostname = this._otiluke_hostname;
    socket.on("error", onerror);
    proxy._otiluke_sockets.add(socket);
    socket.on("close", onsocketclose);
  }
  function onerror (error) {
    options.handlers.failure(this._otiluke_location, this._otiluke_hostname, error.message);
  }
  options.handlers = options.handlers || {__proto__:null};
  options.handlers.failure = options.handlers.failure || signal;
  options.handlers.forgery = (hostname, server) => {
    server._otiluke_hostname = hostname;
    server.on("connection", onconnection);
    proxy._otiluke_servers.add(server);
    server.on("close", onserverclose);
  };
  options.handlers.activity = (location, origin, socket) => {
    socket._otiluke_location = location;
    socket._otiluke_hostname = origin._otiluke_hostname;
    socket.on("error", onerror);
    proxy._otiluke_sockets.add(socket);
    socket.on("close", onsocketclose);
  };
  const listeners = Listeners(vpath, options);
  proxy.on("request", listeners.request);
  proxy.on("connect", listeners.connect);
  proxy.on("upgrade", listeners.upgrade);
  proxy.on("listening", () => { options.handlers.forgery("@PROXY", proxy) });
  proxy.closeAll = closeAll;
  proxy.destroyAll = destroyAll;
  return proxy;
};
