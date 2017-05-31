
var Path = require("path");

function nil () {}

function intercept (intercept) {
  intercept = intercept || {}
  return {
    request: intercept.request || nil,
    connect: intercept.connect || nil
  };
};

function sphere (sphere) {
  if (typeof sphere === "string")
    return {path:Path.resolve(sphere)};
  return {
    path: Path.resolve(sphere.path),
    argument: sphere.argument||null
  };
};

module.exports = function (options) {
  var copy = Object.assign(options, {});
  copy.intercept = intercept(options.intercept);
  copy.sphere = sphere(options.sphere);
  return copy;
};
