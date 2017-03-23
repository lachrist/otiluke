var Http = require("http");
module.exports = function (options, callback) {
  var body = options.body;
  delete options.body;
  var req = Http.request(options, function (res) {
    res.setEncoding(null);
    var buffers = [];
    res.on("data", function (buffer) { buffers.push(buffer) });
    res.on("end", function () {
      callback(res.statusCode, res.headers, Buffer.concat(buffers).toString("utf8"));
    });
  });
};