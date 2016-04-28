var Fs = require("fs");

function isjs (name) { return name.endsWith(".js") }

module.exports = function (path, cb) {
  Fs.readdir(path, function (error, names) {
    if (error)
      return cb(error);
    var files = {};
    names = names.filter(isjs);
    if (!names.length)
      cb(null, {});
    names.forEach(function (name) {
      Fs.readFile(path + "/" + name, "utf8", function (error, content) {
        error ? cb(error) : files[name] = content;
        if (Object.keys(files).length === names.length)
          cb(null, files);
      });
    });
  });
}