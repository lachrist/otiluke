
var transpiles = @TRANSPILES;
var mains = @MAINS;

function cell (text, color, onclick) {
  var td = document.createElement("td");
  td.textContent = text;
  color && (td.style.color = color);
  onclick && (td.onclick = onclick, td.style.cursor = "pointer");
  return td;
}

function sanitize (string) {
  return string.replace(/\W/g, function (c) { return "\\u{"+c.codePointAt(0).toString(16)+"}" });
}

function benchmark (code, row, output) {
  output.length = code.length;
  row.appendChild(cell(code.length, undefined, function () { console.log(code) }));
  try {
    var time1 = performance.now();
    var result = window.eval(code);
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

window.onload = function () {
  var table = document.getElementById("table");
  var keysT = Object.keys(transpiles).sort();
  var keysM = Object.keys(mains).sort();
  var experiments = [];
  function loop (t, m) {
    (m === keysM.length) && (m = 0, t++);
    if (t === keysT.length)
      return document.getElementById("json").textContent = JSON.stringify(experiments, null, 2);
    var socket = new WebSocket("ws"+location.protocol.substring(4)+"//"+location.host+"/"+encodeURIComponent(keysM[m])+"?transpile="+encodeURIComponent(keysT[t]));
    socket.onopen = function () {
      var row = document.createElement("tr");
      table.appendChild(row);
      row.appendChild(cell(keysM[m]));
      row.appendChild(cell(keysT[t]));
      var transpile = transpiles[keysT[t]]({log: function (data) { socket.send(data) }});
      try {
        var transpiled = transpile(mains[keysM[m]], keysM[m]);
        experiments.push(benchmark(transpiled, row, {main:keysM[m], transpile:keysT[t]}));
      } catch (error) {
        alert("Error while transpiling "+keysM[m]+" with "+keysT[t]+": "+error);
        setTimeout(function () { throw error }, 10);
      }
      socket.close();
      loop(t, m+1);
    };
  }
  loop(0, 0);
};
