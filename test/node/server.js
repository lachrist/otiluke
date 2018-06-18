const Http = require("http");
const Subscribe = require("../subscribe.js");
const server = Http.createServer();
Subscribe(server);
server.listen(process.argv[2]);