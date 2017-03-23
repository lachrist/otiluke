var Fs = require("fs");
var Children = require("./children");

module.exports = function (paths) {
  var result = {};
  for (var i=0; i<paths.length; i++)
    result[paths[i]] = Fs.readFileSync(paths[i], "utf8");
  return result;
};
