var Request = require("request");
var buffers = [];
process.stdin.setEncoding(null);
process.stdin.on("data", function (buffer) { buffers.push(buffer) });
process.stdin.on("end", function () {
  Request(Buffer.concat(buffers).toString("utf8"), function (status, headers, body) {
    process.stdout.write(Buffer.from(JSON.stringify([status, headers, body]), "utf8"))
  });
});