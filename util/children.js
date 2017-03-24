var Fs = require("fs");
var Path = require("path");

module.exports = function (path, regexp) {
  return Fs.readdirSync(path)
    .filter(function (name) { return regexp.test(name) })
    .map(function (name) { return Path.resolve(path+"/"+name) });
};
