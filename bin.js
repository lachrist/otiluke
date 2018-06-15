#!/usr/bin/env node

const Path = require("path");
const Minimist = require("minimist");
const options = Minimist(process.argv.slice(2));

if ("node-client" in options) {
  options.transform = require(Path.resolve(options.transform));
  require("./node/client.js")(options);
} else if ("node-server" in options) {
  const print = (address) => typeof address === "string" ? address : address.port;
  const server = options.secure ?
    require("https").createServer({
      key: require("fs").readFileSync(options.key),
      cert: require("fs").readFileSync(options.cert)
    }) :
    require("http").createServer();
  if (options.subscribe)
    require(Path.resolve(options.subscribe))(server);
  server.listen(options.port, () => {
    console.log("node-server listening on: "+print(server.address()));
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