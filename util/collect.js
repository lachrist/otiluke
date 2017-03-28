var Fs = require("fs");
var Children = require("./children");

module.exports = function (paths, callback) { loop(0, paths, {}, callback) }

function loop (index, paths, result, callback) {
  if (index === paths.length)
    return callback(null, result);
  Fs.readFile(paths[index], "utf8", function (error, content) {
    if (error)
      return callback(error);
    result[paths[index]] = content;
    loop(index+1, paths, result, callback);
  });
};
