var Spawn = require("antena/spawn/browser");

module.exports = function (receptor, vsource) {
  return function (source, parameter, argv) {
    source = typeof source === "string" ? {path:source} : source;
    return Spawn({content:[
      "var module = {exports:{}};"
      vbundle,
      "var Virus = module.exports";
      "var source = "+JSON.stringify(source)+";",
      "process.argv[1] = source.path;",
      "virus("+JSON.stringify(parameter)+", process.emitter, function (error, infect) {",
      "  if (error)",
      "    throw error;",
      "  if (source.content)",
      "    return global.eval(infect(source.path, source.content));",
      "  var req = new XMLHttpRequest();",
      "  req.open(\"GET\", source.path)",
      "  req.onload = function () {",
      "    if (req.status !== 200)",
      "      throw new Error(\"Cannot load \"+source.path+\": \"+req.status+\" \"+req.statusText);",
      "    global.eval(infect(source.path, source.content));",
      "  };",
      "  req.send();",
      "});"
    ].join("\n")}, argv, receptor);
  };
};
