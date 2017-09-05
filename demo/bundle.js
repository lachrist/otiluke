
var Fs = require("fs");
var Path = require("path");
var Browserify = require("browserify");
var BundleDependency = require("../spawn/browser/gui/bundle-dependency.js");

module.exports = function (rpath, vpath, callback) {
  Browserify(Path.join(__dirname, "..", "spawn", "browser", "client.js")).bundle(function (error, bundle) {
    if (error)
      return callback(error);
    var script = "var OTILUKE_CLIENT_BUNDLE = "+JSON.stringify(bundle.toString("utf8"))+";\n";
    BundleDependency(rpath, function (error, dependency) {
      if (error)
        return callback(error);
      script += "var OTILUKE_RECEPTOR_DEPENDENCY = "+JSON.stringify(dependency)+";\n";
      BundleDependency(vpath, function (error, dependency) {
        if (error)
          return callback(error);
        script += "var OTILUKE_VIRUS_DEPENDENCY = "+JSON.stringify(dependency)+";\n";
        Browserify(Path.join(__dirname, "main.js")).bundle(function (error, bundle) {
          if (error)
            return callback(error);
          script += bundle.toString("utf8");
          Fs.readFile(Path.join(__dirname, "style.css"), "utf8", function (error, style) {
            if (error)
              return callback(error);
            Fs.readFile(Path.join(__dirname, "index.html"), "utf8", function (error, page) {
              if (error)
                return callback(error);
              callback(null, page.replace(/<-- @([A-Z]+)-->/g, function (match, name) {
                if (name === "SCRIPT")
                  return script;
                if (name === "STYLE")
                  return style;
                throw new Error("Unknown template name: "+name);
              }));
            });
          });
        });
      });
    });
  });
};