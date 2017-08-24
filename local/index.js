
module.exports = function (vpath, receptor) {
  var Virus = typeof vpath === "function" ? vpath : require(vpath);
  return function (parameter, source, script) {
    Virus(parameter, receptor.mock(), function (error, infect) {
      if (error)
        throw error;
      global.eval(infect(source, script));
    });
  };
};
