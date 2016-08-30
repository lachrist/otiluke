var Module = require("module");
var Fs = require("fs");

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

// node launch.js HiddenGlobal transpile.js mains.js argument0 ... argumentN
Object.defineProperty(global, process.argv[2], {
  value: {
    log: function (message) { process.send(message) }
  }
});
var Transpile = require(process.argv.splice(1,3)[2]);
Module._extensions[".js"] = function (module, filename) {
  var content = Fs.readFileSync(filename, "utf8");
  module._compile(Transpile(stripBOM(content), filename), filename);
};
require(process.argv[1]);
