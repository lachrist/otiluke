var Editor = require("./editor.js");
var Select = require("./select.js");
var Benchmark = require("./benchmark.js");
/* TEMPLATE LOG_SPHERES */
/* TEMPLATE TARGETS */
global.onload = function () {
  if (Object.keys(LOG_SPHERES).length === 0)
    LOG_SPHERES["log-sphere.js"] = "";
  if (Object.keys(TARGETS).length === 0)
    TARGETS["target.js"] =  "";
  var editors = {};
  editors.lsphere = Editor("lsphere", "ace/mode/javascript");
  editors.target = Editor("target", "ace/mode/javascript");
  editors.transpiled = Editor("transpiled", "ace/mode/javascript");
  editors.logger = Editor("logger", "ace/mode/text");
  Select(document.getElementById("lsphere-select"), editors.lsphere, LOG_SPHERES);
  Select(document.getElementById("target-select"), editors.target, TARGETS);
  document.getElementById("run-button").onclick = Benchmark(editors);
};