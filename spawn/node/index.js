var Spawn = require("antena/spawn/node");
var Path = require("path");

module.exports = function (receptor, vsource) {
  return function (source, parameter, argv) {
    source = typeof source === "string" ? {path:source} : source;
    vsource = typeof vsource === "string" ? {path:vsource} : source;
    source.path = source.path ? Path.resolve(source.path) : null;
    return Spawn({content:[
      "var Fs = require('fs');",
      "var vsource = "+JSON.stringify(vsource)+";",
      "var Virus = vsource.content ? "+
      "var Virus = "+vsource.content ? "" "require("+JSON.stringify(vpath)+");",
      "var source = "+JSON.stringify(source)+";",
      "process.argv[1] = source.path;",
      "Virus("+JSON.stringify(parameter)+", process.emitter, function (error, infect) {",
      "  if (error)",
      "    throw error;",
      "  return global.eval(infect(source.path, source.content || Fs.readFileSync(source.path, \"utf8\"));",
      "});"
    ]}, argv, receptor);  
  };
};
