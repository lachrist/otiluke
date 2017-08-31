 
var OtilukeSpawnLocal = require("./index.js");

module.exports = function (vpath, receptor, parameter, sources, parallel) {
  var spawn = OtilukeSpawnLocal(require(Path.resolve(options.virus)), receptor);
  collect(options.source).forEach(function (source) {
    spawn(options.parasmeter, source, null, function (error, result) {
      console.log(source, error, result);
    });
  });
};
