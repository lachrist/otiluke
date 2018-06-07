
var Browserify = require("browserify");

module.exports = function (path, callback) {
  Browserify(path).bundle(function (error, bundle) {
    if (error)
      return callback(error);
    callback(null, [
      "function () {",
      "  var s = "+bundle.toString("utf8"),
      "  return s(1);",
      "} ())"
    ].join("\n"));
  });
};
