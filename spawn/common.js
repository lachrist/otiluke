
module.exports = function (Spawn) {
  return function (receptor, vscript, vparameter) {
    return function (script, argv) {
      return Spawn(receptor)([
        "var Virus = "+vscript+";",
        "Virus("+JSON.stringify(vparameter)+", process.emitter, function (error, virus) {",
          "if (error)",
          "  throw error;",
          "global.eval(virus("+JSON.stringify(script)+"));",
        "});"
      ].join("\n"), argv);
    };
  };
};
