
var Browserify = require("brwoserify");

module.exports = function (vpath, callback) {
  var readable = new Readable();
  readable.push("var OTILUKE_VIRUS = require("+JSON.stringify(Path.resolve(vpath))+");\n");
  readable.push(content);
  readable.push(null);
  Browserify(readable, {basedir:__dirname}).bundle(function (error, bundle) {
    if (error)
      return callback(error);
    callback(null, "module.exports = "+JSON.stringify([
      "(function () { ",
      "  "+bundle.toString("utf8"),
      "  return OTILUKE_VIRUS;",
      "} ())"
    ].join("\n"))+";");
  });
};
