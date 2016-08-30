var Fs = require("fs");
var Path = require("path");
var Children = require("./children");

module.exports = function (path, regexp) {
  var result = {};
  Children(path, regexp).forEach(function (child) {
    result[Path.basename(child)] = Fs.readFileSync(child, "utf8");
  });
  return result;
};
