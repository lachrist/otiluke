#!/usr/bin/env node

// otiluke --node-client --port 8080 --transform transform.js                          --data foobar -- main.js arg0 arg1
// otiluke --node-server --port 8080                          --subscribe subscribe.js
// otiluke --mitm-proxy  --port 8080 --transform transform.js --subscribe subscribe.js
// otiluke --mitm-reset

const Path = require("path");
const Minimist = require("minimist");
const options = Minimist(process.argv.slice(2));

if ("node-client" in options) {
  require("./node-client.js")(options);
} else if ("node-server" in options) {
  const print = (address) => typeof address === "string" ? address : address.port;
  const server = require("http").createServer();
  if (options.subscribe)
    require(Path.resolve(options.subscribe))(server);
  server.listen(options.port, () => {
    console.log("node-server listening on: "+print(address));
  });
} else if ("mitm-proxy" in options) {
  const proxy = require("./mitm/proxy")(options);
  if (options.subscribe)
    require(Path.resolve(options.subscribe))(proxy);
  proxy.listen(options.port, () => {
    console.log("mitm-proxy listening on port: "+proxy.address().port);
  });
} else if (options["mitm-reset"]) {
  require("./mitm/reset.js")(options);
}