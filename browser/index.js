
const Listeners = require("./listeners");
const Http = require("http");

const noop = () => {};

function destroySockets (error) {
  for (socket of this._otiluke_sockets) socket.destroy(error);
};

function onproxyclose () {
  for (server of this._otiluke_servers) server.close();
  this.destroySockets();
}

function onerror (error) {
  this._otiluke_handlers.failure(this._otiluke_location, this._otiluke_hostname, error.message);
}

function onsocketclose () {
  this._otiluke_sockets.delete(this);
}

function onserverclose () {
  this._otiluke_servers.delete(this);
}

function onconnection (socket) {
  // Error
  socket._otiluke_handlers = this._otiluke_handlers;
  socket._otiluke_hostname = this._otiluke_hostname;
  socket._otiluke_location = "connection";
  socket.on("error", onerror);
  // Tracking
  this._otiluke_sockets.add(socket);
  socket._otiluke_sockets = this._otiluke_sockets;
  socket.on("close", onsocketclose);
}

function onforgery (hostname, server) {
  // Error
  server._otiluke_handlers = this;
  server._otiluke_hostname = hostname;
  server.on("connection", onconnection);
  // Tracking
  this._otiluke_servers.add(server);
  server._otiluke_servers = this._otiluke_servers;
  server._otiluke_sockets = this._otiluke_sockets;
  server.on("close", onserverclose);
}

function onactivity (location, origin, socket) {
  // Error
  socket._otiluke_handlers = origin._otiluke_handlers;
  socket._otiluke_hostname = origin._otiluke_hostname;
  socket._otiluke_location = location;
  socket.on("error", onerror);
  // Tracking
  this._otiluke_sockets.add(socket);
  socket._otiluke_sockets = this._otiluke_sockets;
  socket.on("close", onsocketclose);
}

module.exports = (vpath, options) => {
  const servers = new Set();
  const sockets = new Set();
  options.handlers = options.handlers || {__proto__:null};
  options.handlers._otiluke_sockets = sockets;
  options.handlers._otiluke_servers = servers;
  options.handlers.failure = options.handlers.failure || noop;
  options.handlers.forgery = onforgery;
  options.handlers.activity = onactivity;
  const proxy = Http.createServer();
  proxy.destroySockets = destroySockets;
  proxy._otiluke_sockets = sockets;
  proxy._otiluke_servers = servers;
  proxy._otiluke_hostname = "PROXY";
  proxy._otiluke_handlers = options.handlers;
  proxy._otiluke_proxy = proxy;
  const listeners = Listeners(vpath, options);
  proxy.on("close", onproxyclose);
  proxy.on("connection", onconnection);
  proxy.on("request", listeners.request);
  proxy.on("connect", listeners.connect);
  proxy.on("upgrade", listeners.upgrade);
  return proxy;
};
