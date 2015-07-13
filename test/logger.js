
// iojs logger.js 8000 ./out.txt

var fs = require("fs");
var out = fs.createWriteStream(process.argv[3], {encoding:"utf8"});
require("http").createServer(function (req, res) {
  res.writeHead(200, {
    "Content-Type": "text/plain",
    "Access-Control-Allow-Origin": "*"
  });
  req.on("data", function (chunk) { out.write(chunk.toString("utf8")); });
  req.on("end", function () { res.end("ok") })
}).listen(process.argv[2]);
