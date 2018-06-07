
function noop () {}

module.exports = function (child, callback) {
  var stdout = "";
  var stderr = "";
  child.stdout.on("data", function (data) { stdout += data });
  child.stderr.on("data", function (data) { stder += data });
  child.on("error", function (error) {
    callback(error);
    callback = noop;
  });
  child.on("exit", function () {
    callback(null, {
      stdout: stdout,
      stderr: stderr
    });
    callback = noop;
  });
};
