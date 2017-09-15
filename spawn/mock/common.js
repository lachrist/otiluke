
// global.process and inline require("f"+"s") to avoid undesirable browserify bundles //

var EmitterMock = require("antena/emitter/mock.js");

var require("antena/")

module.exports = function (spawn) {
  return function (receptor, vpath) {
    return function (source, parameter, argv) {
      ["VIRUS(PARAMETER, process.emitter, function (error, infect) {",
      "  if (error)",
      "    throw error();",
      "  global.eval"]
    }
  }
};


module.exports = function (performance, load) {
  return function (receptor, virus) {
    return function (parameter, source, script, callback) {
      var zero = performance.now();
      virus(parameter, EmitterMock(receptor), function (error, infect) {
        function onload (error, script) {
          if (error)
            return callback(error);
          try {
            global.eval(infect(source, script));
          } catch (error) {
            return callback(error);
          }
          callback(null, {
            stdout: "",
            stderr: error ? (error instanceof Error ? error.stack||error.message  : ""+error) : "",
            time: performance.now() - zero
          });
        }
        error || script ? onload(error, script) : load(source, onload);
      });
    };
  };
};
