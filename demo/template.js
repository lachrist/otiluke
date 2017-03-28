var Editors = require("./editors.js");
var Select = require("./select.js");
var Benchmark = require("./benchmark.js");
/* TEMPLATE SPHERES */
/* TEMPLATE TARGETS */
global.onload = function () {
  var editors = Editors();
  Select(editors, SPHERES, TARGETS);
  document.getElementById("run-button").onclick = Benchmark(editors);
};
