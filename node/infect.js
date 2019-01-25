
const Fs = require("fs");
const Path = require("path");
const Module = require("module");

// https://github.com/nodejs/node/blob/v11.x/lib/internal/modules/cjs/helpers.js
function stripBOM(content) {
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return content;
}

module.exports = (transform, command) => {
  // https://github.com/nodejs/node/blob/master/lib/internal/modules/cjs/loader.js
  Module._extensions[".js"] = function (module, filename) {
    var content = Fs.readFileSync(filename, "utf8");
    module._compile(stripBOM(transform(content, filename)), filename);
  };
  process.argv = ["node"].concat(command);
  require(Path.resolve(process.argv[1]));
};
