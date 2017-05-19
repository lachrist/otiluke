var Fs = require("fs");
var Path = require("path");
var RendezVous = require("./rendez-vous.js");

function isjs (path) {
  return /\.js$/.test(path)
}

module.exports = function (path, callback) {
  if (isjs(path)) {
    Fs.readFile(path, "utf8", function (error, content) {
      if (error)
        return callback(error);
      var result = {};
      result[Path.basename(path)] = content;
      callback(null, result);
    });
  } else {
    Fs.readdir(path, function (error, names) {
      if (error)
        return callback(error);
      names = names.filter(isjs);
      var rdv = RendezVous(names.length, {}, callback);
      names.forEach(function (name) {
        Fs.readFile(Path.join(path, name), "utf8", rdv(function (content, result) {
          result[name] = content;
        }));
      });
    });
  }
};
