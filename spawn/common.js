
module.exports = function (Spawn) {
  return function (receptor, vscript) {
    return function (script, argv) {
      return Spawn(receptor)([
        "var Virus = "+vscript+";",
        "Virus("+JSON.stringify(argv.shift())+", process.emitter, function (error, virus) {",
        "  if (error)",
        "    throw error;",
        "  delete process.emitter;",
        "  global.eval(virus("+JSON.stringify(script)+"));",
        "});"
      ].join("\n"), argv);
    };
  };
};
