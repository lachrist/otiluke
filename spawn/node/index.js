var Spawn = require("antena/spawn/node");
var Path = require("path");

module.exports = function (receptor, vpath) {
  return function (source, parameter, argv) {
    var child = Spawn(Path.join(__dirname, "child.js"), argv, receptor);
    child.send({
      vpath: vpath,
      parameter: parameter,
      source: typeof source === "string" ? {path:source} : source
    });
    return child;
  };
};
