
/* TEMPLATE SPLITTER */
/* TEMPLATE SPHERES */
/* TEMPLATE TARGETS */

var Request = require("request-uniform/browser");
var Truncate = require("../util/truncate.js");

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
  var table = document.getElementById("table");
  var ss = Object.keys(SPHERES).sort();
  var ts = Object.keys(TARGETS).sort();
  var experiments = [];
  function loop (i) {
    if (i === ss.length * ts.length)
      return document.getElementById("json").textContent = JSON.stringify(experiments, null, 2);
    var s = ss[Math.floor(i/ts.length)];
    var t = ts[i%ts.length];
    var socket = new WebSocket("ws"+location.protocol.substring(4)+"//"+location.host+"?sphere="+encodeURIComponent(s)+"&target="+encodeURIComponent(t));
    socket.onopen = function () {
      var row = document.createElement("tr");
      table.appendChild(row);
      row.appendChild(cell(Truncate.begin(s, 20)));
      row.appendChild(cell(Truncate.begin(t, 20)));
      var sphere = SPHERES[s](RequestBrowser, WebSocket, {
        sphere: s,
        target: t,
        socket: socket,
        request: Request(location.origin+"/otiluke"+SPLITTER)
      });
      try {
        var script = sphere(TARGETS[t], t);
        experiments.push(benchmark(script, row, {sphere:s, target:t}));
      } catch (error) {
        alert("Error while compiling "+t+" with "+s+": "+error);
        setTimeout(function () { throw error }, 10);
      }
      socket.close();
      loop(i+1);
    };
  }
  loop(0);
};
