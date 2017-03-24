// node launch.js comp.js 8080 mains.js argument0 ... argumentN

var Fs = require("fs");
var Module = require("module");
var Request = require("../util/request/node");
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
  target: process.argv.slice(4).join(" "),
  send: process.send.bind(process),
  request: Request("http://localhost:"+process.argv[3])
});
process.on("message", sphere.onmessage);

Module._extensions[".js"] = function (module, filename) {
  var content = Fs.readFileSync(filename, "utf8");
  module._compile(sphere.onscript(stripBOM(content), filename), filename);
};

process.on("beforeExit", function () {
  process.on("message", );
});
  
process.argv.splice(1, 3);
require(process.argv[1]);