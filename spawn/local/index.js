
var Fs = require("fs");

module.exports = function (virus, receptor) {
  return function (parameter, source, script, callback) {
    virus(parameter, receptor.local(), function (error, infect) {
      function done (error, script) {
        if (error)
          return callback(error);
        try {
          callback(null, global.eval(infect(body.source, script)));
        } catch (error) {
          callback(error);
        }
      }
      if (error || "script" in body)
        return done(error, body.script);
      if (!("window" in global))
        return Fs.readFile(source, "utf8", done);
      var req = new XMLHttpRequest();
      req.open("GET", source);
      req.onerror = callback;
      req.onload = function () {
        done(req.status !== 200 && new Error("Cannot load "+source+": "+req.status+" "+req.statusText), req.responseText);
      };
      req.send();
    });
  };
};
