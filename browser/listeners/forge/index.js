
const Fs = require("fs");
const Path = require("path");
const Http = require("http");
const Https = require("https");
const ChildProcess = require("child_process");
const Prompt = require("./prompt.js");
const Sign = require("./sign.js");

module.exports = (agent, sockdir, cahome) => {
  let server = [];
  const servers = Object.create(null);
  const token = Math.random().toString(36).substring(2);
  let counter = 0;
  Http.createServer().listen(Path.join(sockdir, token), function () {
    const temporary = server;
    server = this;
    server._otiluke_hosts = [];
    temporary.forEach(([hostname, port, callback]) => { forge(hostname, port, callback) });
  });
  const forge = (hostname, port, callback) => {
    if (Array.isArray(server)) {
      server.push([hostname, port, callback]);
    } else {
      Prompt(agent, hostname, port, (error, secure) => {
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
              Sign(hostname, cahome, (error, options) => {
                if (error) {
                  callback(error);
                } else {
                  Https.createServer(options).listen(Path.join(sockdir, token+"-"+(++counter)), function () {
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
