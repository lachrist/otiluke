
var Url = require("url");
var Http = require("http");
var ChildProcess = require("child_process");
var Request = require("./request.js");

module.exports = function (url) {
  var parts = Url.parse(url);
  return function (method, path, headers, body, callback) {
    var options = {
      protocol: parts.protocol,
      hostname: parts.hostname,
      port: Number(parts.port),
      method: method,
      path: path,
      headers: headers,
      body: body
    };
    if (callback)
      return Request(options, callback);
    var child = ChildProcess.spawnSync("node", [__dirname+"/child.js"], {
      encoding: "utf8",
      input: JSON.stringify(options)
    });
    console.log(child.stdout);
    if (child.status !== 0)
      throw new Error(child.stderr);
    return JSON.parse(child.stdout);
  };
};
