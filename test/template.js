
var Request = require("../request/browser.js");

function cell (text, color, onclick) {
  var td = document.createElement("td");
  td.textContent = text;
  color && (td.style.color = color);
  onclick && (td.onclick = onclick, td.style.cursor = "pointer");
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
  var cs = Object.keys(COMPS).sort();
  var ms = Object.keys(MAINS).sort();
  var experiments = [];
  function loop (i) {
    if (i === cs.length * ms.length)
      return document.getElementById("json").textContent = JSON.stringify(experiments, null, 2);
    var c = cs[Math.floor(i/cs.length)];
    var m = ms[i%cs.length];
    var socket = new WebSocket("ws"+location.protocol.substring(4)+"//"+location.host+"?comp="+encodeURIComponent(c)+"&main="+encodeURIComponent(m));
    socket.onmessage = function (event) {
      delete socket.onmessage;
      var row = document.createElement("tr");
      table.appendChild(row);
      row.appendChild(cell(c));
      row.appendChild(cell(m));
      var comp = COMPS[c]({
        socket: socket,
        request: Request(location.protocol+"//"+location.host+"/"+event.data)
      });
      try {
        var script = comp(MAINS[m], m);
        experiments.push(benchmark(script, row, {main:m, comp:c}));
      } catch (error) {
        alert("Error while compiling "+m+" with "+c+": "+error);
        setTimeout(function () { throw error }, 10);
      }
      socket.close();
      loop(i+1);
    };
  }
  loop(0);
};
