
const Listeners = require("./listeners");
const Http = require("http");
const Https = require("https");

const noop = () => {};

////////////
// Common //
////////////

function onerror (error) {
  this._otiluke_server._otiluke_failure(this._otiluke_location, this._otiluke_server._otiluke_hostname, error.message);
}

function onclose () {
  this._otiluke_emitters.delete(this);
}

const listenerror = (emitter, location, server) => {
  emitter._otiluke_server = server;
  emitter._otiluke_location = location;
  emitter.on("error", onerror);
}

const listenclose = (emitter, emitters) => {
  emitters.add(emitter);
  emitter._otiluke_emitters = emitters;
  emitter.on("close", onclose);
}

/////////////////////
// Register Server //
/////////////////////

function forgery (hostname, server) {
  listenclose(server, this._otiluke_servers);
  server._otiluke_hostname = hostname;
  server._otiluke_sockets = this._otiluke_sockets;
  server._otiluke_failure = this._otiluke_failure;
  server.on("connection", onconnection);
  server.on("upgrade", onupgrade);
  server.on("connect", onconnect);
  server.on("request", onrequest);
}

function onconnection (socket) {
  listenclose(socket, this._otiluke_sockets);
}

function onupgrade (request, socket, head) {
  listenerror(socket, "initial-upgrade-socket", this);
}

function onconnect (request, socket, head) {
  listenerror(socket, "initial-connect-socket", this);
}

function onrequest (request, response) {
  listenerror(request, "initial-request", this);
  listenerror(request, "initial-response", this);
}

//////////////////////
// Register Request //
//////////////////////

function request (request) {
  listenerror(request, "forward-request", this);
  request.on("response", onresponse);
}

function onresponse (response) {
  listenerror(response, "forward-response", this._otiluke_server);
}

/////////////////////
// Register Socket //
/////////////////////

function connect (socket) {
  listenclose(socket, this._otiluke_sockets);
  listenerror(socket, this._otiluke_hostname ? "forward-connect-socket" : "proxy-connect-socket", this);
}

function upgrade (socket) {
  listenclose(socket, this._otiluke_sockets);
  listenerror(socket, "forward-upgrade-socket" , this);
}

////////////
// Return //
////////////

function destroyAll () {
  for (let socket of this._otiluke_sockets) socket.destroy();
  this._otiluke_agents.http.destroy();
  this._otiluke_agents.https.destroy();
};

function closeAll () {
  this.close();
  for (let server of this._otiluke_servers) server.close();
};

module.exports = (vpath, options) => {
  options = Object.assign({__proto__:null, onfailure:noop}, options);
  options.register = {__proto__: null, connect, upgrade, request, forgery};
  const listeners = Listeners(vpath, options);
  const servers = new Set();
  const sockets = new Set();
  const agents = {
    __proto__: null,
    http: new Http.Agent({keepAlive:true}),
    https: new Https.Agent({keepAlive:true})
  };
  const proxy = Http.createServer();
  proxy._otiluke_failure = options.onfailure;
  proxy._otiluke_hostname = "PROXY";
  proxy._otiluke_sockets = sockets;
  proxy._otiluke_servers = servers;
  proxy._otiluke_agents = agents;
  proxy.destroyAll = destroyAll;
  proxy.closeAll = closeAll;
  proxy.on("connection", onconnection);
  proxy.on("request", onrequest);
  proxy.on("connect", onconnect);
  proxy.on("upgrade", onupgrade);
  proxy.on("request", listeners.request);
  proxy.on("connect", listeners.connect);
  proxy.on("upgrade", listeners.upgrade);
  return proxy;
};
