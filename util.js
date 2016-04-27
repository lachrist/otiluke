
var Fs = require("fs");

function isjs (name) { return /\.js$/.test(name) }

exports.alljs = function (path, cb) {
  Fs.readdir(path, function (error, names) {
    if (error)
      return cb(error);
    var files = {};
    names = names.filter(isjs);
    names.forEach(function (name) {
      Fs.readFile(path + "/" + name, "utf8", function (error, content) {
        error ? cb(error) : file[name] = content;
        if (Object.keys(files).length === names.length)
          cb(null, files);
      });
    });
  });
}

exports.log = function (context) {
  return function (err) {
    process.stderr.write(context + " >> " + err.message + "\n");
  }
}

exports.icon = function () {
  return "data:image/png;base64," + Fs.readFileSync(__dirname+"/img/otiluke.png").toString("base64");
}
