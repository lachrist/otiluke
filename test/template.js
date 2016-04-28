
var targets = @TARGETS;

var Transform = require(@TRANSFORM);
var JsBeautify = require("js-beautify").js_beautify;
var Print = require("../util/print.js");

function cell (text, color) {
  var td = document.createElement("td");
  td.textContent = text;
  color && (td.style.color = color);
  return td;
}

function benchmark (code, row) {
  row.appendChild(cell(code.length));
  try {
    var time1 = performance.now();
    var result = window.eval(code);
    var time2 = performance.now();
    row.appendChild(cell(Print(result), "green"));
  } catch (e) {
    var time2 = performance.now();
    var error = e;
    row.appendChild(cell(Print(error), "red"));
  }
  row.appendChild(cell(Math.ceil(time2-time1)));
  return error;
}

window.onload = function () {
  var table = document.getElementById("output");
  var keys = Object.keys(targets).sort();
  function run (i) {
    if (i < keys.length) {
      setTimeout(run, 10, i+1);
      var row = document.createElement("tr");
      table.appendChild(row);
      row.appendChild(cell(keys[i]));
      var error1 = benchmark(targets[keys[i]], row);
      try {
        var transformed = Transform(targets[keys[i]], keys[i]);
      } catch (error) {
        alert("Error during transformation: " + error);
        throw error;
      }
      var error2 = benchmark(JsBeautify(transformed), row);
      if (error2)
        throw error2;
    }
  }
  setTimeout(run, 10, 0);
};
