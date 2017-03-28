
var Http = require("http");
var ChildProcess = require("child_process");

function  (headers) {
  var xs = [];
  for (var h in headers) {
    xs.push("--header");
    xs.push(JSON.stringify(h+": "+headers[h]));
  }
  return xs;
}

function parse (lines) {
  var headers = {};
  for (var i=0; i<lines.length; i++) {
    var parts = lines[i].split(": ", 2);
  }
}

module.exports = function (socket) {
  return function (method, path, headers, body, callback) {
    if (callback) {
      Http.request({
        protocol: "http:",
        socketPath: socket,
        method: method,
        path: path,
        headers: headers
      }, function (res) {
        var buffers = [];
        res.on("data", function (buffer) { buffers.push(buffer) });
        res.on("end", function () {
          callback(res.statusCode, res.headers, Buffer.concat(buffers).toString("utf8"));
        });
      }).end(body, "utf8");
    } else {
      var result = ChildProcess.spawnSync("curl", [
        "--unix-socket", socket,
        "--request", method,
        "--data-binary", "@-", // data from stdin
        "--include",           // headers in stdout
        "--silent"             // no progress information
      ].concat(final(headers), path), {input:body, encoding:"utf8"});
      if (result.error)
        throw error;
      if (result.status !== 0)
        throw new Error("Error within curl process: "+result.status+" "+result.stderr);
      var parts = result.stdout.split("\r\n\r\n", 2);
      var lines = parts[0].split("\r\n");
      var headers = {};
      for (var i=1; i<lines.length; i++) {
        var binding = lines[i].split("\r\n", 2);
        headers[binding[0]] = binding[1];
      }
      return [
        Number(lines[0].substring(9, 12)),
        headers,
        parts[1],
      ];
    }
  };
};
