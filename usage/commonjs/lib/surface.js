
var Pow = require("./pow.js");

var pi = Math.PI || 3.1416;

exports.square = function (x) {
  return Pow(x, 2);
};

exports.cube = function (x) {
  return Pow(x, 3);
};

exports.circle = function (r) {
  return pi * Pow(r, 2);
};

exports.sphere = function (r) {
  return 4/3 * pi * Pow(r, 3);
}
