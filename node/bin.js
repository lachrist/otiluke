#!/usr/bin/env node

// node launch.js {cast:"cast.js",path:"sphere.js",json:"json-data"} localhost:8080 main.js argument0 ... argumentM

var Fs = require("fs");
var Path = require("path");
var Module = require("module");
var Channel = require("channel-uniform/node");

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

var channel = Channel(process.argv[1], false);
process.argv[0] = "node";
process.argv.splice(1, 2);

channel.request("GET", "/otiluke-sphere", {}, "", function (error, response) {
  if (error)
    throw error;
  if (response.status !== 200)
    throw new Error("Cannot load sphere: "+response.status+"("+response.reason+")");
  var data = JSON.parse(response.body);
  var Cast = require(data.path.cast);
  var Sub = require(data.path.sub);
  var Sphere = Cast(Sub);
  var sphere = Sphere(data.argument, channel);
  console.log(Module._extensions);
  Module._extensions[".js"] = function (module, filename) {
    var content = Fs.readFileSync(filename, "utf8");
    // TODO RESOLVE BUG with require("ws")
    // if (filename.indexOf("node_modules") !== -1)
    //   return module._compile(stripBOM(content), filename);
    // END TODO
    module._compile(stripBOM(sphere(content, filename)), filename);
  };
  require(Path.resolve(process.argv[1]));
});
