
const Fs = require("fs");
const Path = require("path");
const Http = require("http");
const Https = require("https");
const ChildProcess = require("child_process");
const ForgeSecure = require("./forge-secure.js");
const ForgeSign = require("./forge-sign.js");

module.exports = (ipcdir, cahome) => {
  let server = [];
  const servers = Object.create(null);
  const token = Math.random().toString(36).substring(2);
  let counter = 0;
  Http.createServer().listen(Path.join(ipcdir, token), function () {
    const temporary = server;
    server = this;
    server._otiluke_hosts = [];
    temporary.forEach(([hostname, port, callback]) => { forge(hostname, port, callback) });
  });
  const forge = (hostname, port, callback) => {
    if (Array.isArray(server)) {
      server.push([hostname, port, callback]);
    } else {
      ForgeSecure(hostname, port, (error, secure) => {
        if (error) {
          callback(error);
        } else {
          if (secure) {
            if (hostname in servers) {
              if (Array.isArray(servers[hostname])) {
                servers[hostname].push(callback);
              } else {
                callback(null, servers[hostname]);
              }
            } else {
              servers[hostname] = [callback];
              ForgeSign(hostname, cahome, (error, options) => {
                if (error) {
                  callback(error);
                } else {
                  Https.createServer(options).listen(Path.join(ipcdir, token+"-"+(++counter)), function () {
                    servers[hostname].forEach((callback) => { callback(null, this) });
                    servers[hostname] = this;
                  });
                };
              });
            }
          } else {
            callback(null, server);
          }
      }
    });
    }
  };
  return forge;
};
