const Http = require("http");
const Subscribe = require("../subscribe");
const server = Http.createServer();
Subscribe(server);
server.listen(process.argv[2]);