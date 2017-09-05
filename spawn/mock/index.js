
var Fs = require("fs");
var EmitterMock = require("antena/emitter/mock.js");

var isnode = typeof window === "undefined";

module.exports = function (receptor, virus) {
  return function (parameter, source, script, callback) {
    var zero = isnode ? process.hrtime() : performance.now();
    function done (error) {
      if (!callback)
        throw error;
      var time = isnode ? process.hrtime(zero) : zero-performance.now();
      callback(null, {
        stdout: "",
        stderr: error ? (error instanceof Error ? error.stack : ""+error) : "",
        time: isnode ? (1e9*time[0]+time[1])/1e6 : time
      });
    }
    virus(parameter, EmitterMock(receptor), function (error, infect) {
      function onload (error, script) {
        if (error)
          return done(error);
        try {
          global.eval(infect(source, script));
        } catch (error) {
          done(error);
        }
      }
      if (error || script)
        return onload(error, script);
      if (isnode)
        return Fs.readFile(source, "utf8", onload);
      var req = new XMLHttpRequest();
      req.open("GET", source);
      req.onerror = onload;
      req.onload = function () {
        onload(req.status !== 200 && new Error("Cannot load "+source+": "+req.status+" "+req.statusText), req.responseText);
      };
      req.send();
    });
  };
};
