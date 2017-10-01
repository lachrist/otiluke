// node launch.js 8080 parameter main.js argument0 ... argumentM

var Fs = require("fs");
var Http = require("http");
var Path = require("path");
var Module = require("module");
var EmitterNode = require("antena/emitter/node");

// VERBATIM https://github.com/nodejs/node/blob/v5.10.0/lib/module.js
// Module._extensions['.js'] = function(module, filename) {
//   var content = fs.readFileSync(filename, 'utf8');
//   module._compile(internalModule.stripBOM(content), filename);
// };
// VERBATIM https://github.com/nodejs/node/blob/v5.10.0/lib/internal/module.js
/**
 * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
 * because the buffer-to-string conversion in `fs.readFileSync()`
 * translates it to FEFF, the UTF-16 BOM.
 */

function stripBOM(content) {
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return content;
}

module.exports = function (port, parameter, source) {
  var emitter = EmitterNode(port, false);
  emitter.request("GET", "/", {}, "", function (error, status, reason, headers, body) {
    if (error || status !== 200)
      throw error || new Error(status+" "+reason);
    var Virus = require(body);
    Virus(parameter, emitter.fork("x"), function (error, infect) {
      if (error)
        throw error;
      Module._extensions[".js"] = function (module, filename) {
        var content = Fs.readFileSync(filename, "utf8");
        // TODO RESOLVE BUG with require("ws")
        // if (filename.indexOf("node_modules") !== -1)
        //   return module._compile(stripBOM(content), filename);
        // END TODO
        module._compile(stripBOM(infect(filename, content)), filename);
      };
      require(Path.resolve(source));
    });
  });
};
