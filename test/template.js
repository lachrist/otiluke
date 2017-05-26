
/* TEMPLATE SPHERE_PATH */
/* TEMPLATE SPHERE_ARGUMENT */
/* TEMPLATE TARGETS */

var Sphere = require(SPHERE_PATH);
var ChannelBrowser = require("channel-uniform/browser");

function cell (text, color, onclick) {
  var td = document.createElement("td");
  td.textContent = text;
  if (color)
    td.style.color = color;
  if (onclick) {
    td.onclick = onclick;
    td.style.cursor = "pointer";
  }
  return td;
}

function benchmark (code, row, output) {
  output.length = code.length;
  row.appendChild(cell(code.length, undefined, function () { console.log(code) }));
  try {
    var time1 = performance.now();
    var result = global.eval(code);
    var time2 = performance.now();
    row.appendChild(cell(output.result = ""+result, "green", function () { console.dir(result) }));
  } catch (error) {
    var time2 = performance.now();
    setTimeout(function () { throw error }, 10);
    row.appendChild(cell(output.error = ""+error, "red", function () { console.dir(error) }));
  }
  row.appendChild(cell(output.time = Math.ceil(1000*(time2-time1))));
  return output;
}

global.onload = function () {
  Sphere(SPHERE_ARGUMENT, ChannelBrowser(location.host, false), function (instrument) {
    var table = document.getElementById("table");
    var experiments = [];
    Object.keys(TARGETS).sort().forEach(function (name) {
      var row = document.createElement("tr");
      table.appendChild(row);
      row.appendChild(cell(name));
      var script = instrument(TARGETS[name], name);
      experiments.push(benchmark(script, row, {source:name}));
    });
    document.getElementById("json").value = JSON.stringify(experiments, null, 2);      
  });
}
