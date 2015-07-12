
var http = require("http")
var server = http.createServer(function (req, res) {
  res.writeHead(200, {"Content-Type": "text/plain"});
  req.on("data", function (chunk) { console.log(chunk.toString("utf8")) });
  req.on("end", function () { res.end("ok") })
}).listen(process.argv[2]);
