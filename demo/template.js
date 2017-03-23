var Editors = require("./editors.js");
var Select = require("./select.js");
var Benchmark = require("./benchmark.js");
global.onload = function () {
  var editors = Editors();
  Select(editors, COMPS, MAINS);
  Benchmark(editors);
};