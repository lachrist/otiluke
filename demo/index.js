
var Fs = require("fs");
var Bundle = require("../util/bundle.js");
var Icon = require("../util/icon.js");
var Collect = require("../util/collect.js");
var Bind = require("../util/bind.js");

module.exports = function (options, callback) {
  var dependencies = [];
  options.spheres.forEach(function (sphere) {
    Fs.readFileSync(sphere, "utf8").replace(/[^a-zA-Z_$]require\s*\(\s*((\"[^"]*\")|(\'[^']*\'))\s*\)/g, function (match, name) {
      dependencies.push({name:global.eval(name), basedir:options.basedir});
    });
  });
  Bundle(Bind.js(Fs.readFileSync(__dirname+"/template.js", "utf8"), {
    SPHERES: "var SPHERES = "+JSON.stringify(Collect(options.spheres), null, 2)+";",
    TARGETS: "var TARGETS = "+JSON.stringify(Collect(options.targets), null, 2)+";"
  }), __dirname, [].concat.apply([], options.spheres.map(requires)).map(), function (error, bundle) {
    callback(error, error || Bind.html(Fs.readFileSync(__dirname+"/template.html", "utf8"), {
      ICON: Icon,
      BUNDLE: bundle
    }));
  });
};

function requires (path) {
  var names = [];
  Fs.readFileSync(path, "utf8").replace(/[^a-zA-Z_$]require\s*\(\s*((\"[^"]*\")|(\'[^']*\'))\s*\)/g, function (match, name) {
    names.push(global.eval(name));
  });
  return names;
}
