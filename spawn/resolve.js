
var paths = {};



(function () {
  var global = this;
  var modules = {};
  function require (path) {
    if (path in modules)
      return modules[path];
    var req = new XMLHttpRequest();
    req.open();

  };

  function run (path, script) {
    var module = {exports:{}};
    Function("global", "__dirname", "__filename", "require", "module", "exports", script).call(null, global, /(.*)\/[^/]+\.js$/.exec(path)[1], path, require, );
    return module.exports
  }

} ());
