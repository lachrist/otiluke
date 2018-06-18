
const Fs = require("fs");
const Path = require("path");
const Module = require("module");
const Antena = require("antena/node");

// https://github.com/nodejs/node/blob/v10.x/lib/internal/modules/cjs/helpers.js
function stripBOM(content) {
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return content;
}

module.exports = (Virus, options) => {
  process.argv = ["node"].concat(options._);
  const antena = "host" in options ? new Antena(options.host, options.secure) : null;
  options = Object.assign({}, options);
  delete options._;
  delete options.host;
  delete options.secure;
  Virus(antena, options, (error, transform) => {
    if (error)
      throw error;
    // https://github.com/nodejs/node/blob/master/lib/internal/modules/cjs/loader.js
    Module._extensions[".js"] = function (module, filename) {
      var content = Fs.readFileSync(filename, "utf8");
      module._compile(stripBOM(transform(content, filename)), filename);
    };
    require(Path.resolve(process.argv[1]));
  });
};
