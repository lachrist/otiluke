// node launch.js sphere.js main.js -- argument0 ... argumentN

var Fs = require("fs");
var Module = require("module");
var Request = require("request-uniform/node");
var Sphere = require(process.argv[2]);

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
var sphere = Sphere({
  sphere: process.argv[2],
  target: process.argv.slice(4).join(" "),
  request: Request(process.argv[3]),
  socket: {
    send: function (message) { process.send(message) },
    set onmessage (listener) {
      process.removeAllListeners("message");
      if (listener)
        process.on("message", listener);
    }
  }
});
process.on("message", sphere.onmessage);
Module._extensions[".js"] = function (module, filename) {
  var content = Fs.readFileSync(filename, "utf8");
  module._compile(stripBOM(sphere(content, filename)), filename);
};
process.argv.splice(1, 3);
require(process.argv[1]);