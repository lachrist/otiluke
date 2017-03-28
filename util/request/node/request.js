// http://bhavin.directi.com/unix-domain-sockets-vs-tcp-sockets/
// https://lists.freebsd.org/pipermail/freebsd-performance/2005-February/001143.html

var Http = require("http");
module.exports = function (options, callback) {
  var body = options.body;
  delete options.body;
  var req = Http.request(options, function (res) {
    var buffers = [];
    res.on("data", function (buffer) { buffers.push(buffer) });
    res.on("end", function () {
      callback(res.statusCode, res.headers, Buffer.concat(buffers).toString("utf8"));
    });
  });
  req.end(body, "utf8");
};
