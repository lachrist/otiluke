
var Editor = require("./editor.js");

module.exports = function (container, dependency) {
  var self = Object.create(prototype);
  Object.assign(self, Editor(container));
  self._bundle_ = dependency.bundle;
  self.set(dependency.inital || "");
  if (dependency.names) {
    var span = document.createElement("span");
    span.innerText = "Modules available for require: "+dependency.names.join(",")+".";
    container.appendChild(span);
  }
  var div = document.createElement("div");
  container.appendChild(div);
  return self;
};

var prototype = Object.create(Editor.prototype);
prototype.get = function () {
  return [
    "(function () {",
    "  "+this._bundle_,
    "  var module = {exports:{}};",
    "  var exports = module.exports;",
    "  "+Editor.prototype.get.apply(this),
    "  return module.exports;"
    "} ())"
  ].join("\n");
};