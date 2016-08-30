var Fs = require("fs");
var Path = require("path");

module.exports = function (path, regexp) {
  if (!path)
    return [];
  try {
    return Fs.readdirSync(path)
      .filter(function (name) { return regexp.test(name) })
      .map(function (name) { return Path.resolve(path+"/"+name) });
  } catch (error) {
    if (error.code === "ENOTDIR")
      return regexp.test(Path.basename(path)) ? [Path.resolve(path)] : [];
    throw error;
  }
};
