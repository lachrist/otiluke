
var Fs = require("fs");
var Path = require("path");

function tohexa (c) { return "\\x"+c.charCodeAt(0).toString(16).toUpperCase() }
function sanitize (name) { return name.replace(/[\.\/\\\0\'\"]/g, tohexa) }

function setup (path) {
  if (!path)
    return function () { return process.stdout };
  try {
    var names = Fs.readdirSync(path);
  } catch (error) {
    if (error.code !== "ENOTDIR")
      throw error;
    var stream = Fs.createWriteStream(path);
    return function () { return stream };
  }
  return function (name) {
    name = sanitize(name);
    var counter = 0;
    while (names.indexOf(name+"#"+counter) !== -1)
      counter++;
    names.push(name+"#"+counter);
    return Fs.createWriteStream(path+"/"+name+"#"+counter);
  }
}

module.exports = function (path) {
  var make = setup(path);
  return function (transpile, main) {
    var stream = make(transpile, main);
    return function (message) {
      stream.write(message);
    };
  };
};
