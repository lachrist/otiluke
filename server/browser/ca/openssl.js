
var ChildProcess = require("child_process");

module.exports = function (argv, callback) {
  var error = "";
  var options = {stdio:["ignore", "ignore", "pipe"], encoding:"utf8"};
  var child = ChildProcess.spawn("openssl", argv, options);
  child.stderr.on("data", function (data) { error += data });
  child.on("close", function (code) {
    callback(code && new Error("openssl "+argv.join(" ")+" failed with "+code+"\n"+error));
  });
};
