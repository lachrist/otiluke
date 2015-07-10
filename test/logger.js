
var http = require("http")
var server = http.createServer(function (req, res) {
  res.writeHead(200, {"Content-Type": "text/plain"});
  console.log("#################### LOGGER ####################");
  req.on("data", function (chunk) { console.log(chunk.toString("utf8")) });
  req.on("end", function () { res.end("yo") })
});
server.listen(process.argv[2], "127.0.0.1");
