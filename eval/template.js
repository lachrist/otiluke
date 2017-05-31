
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

function benchmark (script, row, output) {
  try {
    var time1 = performance.now();
    var result = global.eval(script);
    var time2 = performance.now();
    row.appendChild(cell(output.result = ""+result, "green", function () {
      console.dir(result);
    }));
  } catch (error) {
    var time2 = performance.now();
    setTimeout(function () { throw error }, 10);
    row.appendChild(cell(output.error = ""+error, "red", function () {
      console.dir(error);
    }));
  }
  row.appendChild(cell(output.time = Math.ceil(1000*(time2-time1))));
  return output;
}

global.onload = function () {
  var channel = ChannelBrowser(location.host, false);
  TEMPLATE.sphere.module(TEMPLATE.sphere.argument, channel, function (sphere) {
    var table = document.getElementById("table");
    var experiments = [];
    Object.keys(TEMPLATE.targets).sort().forEach(function (name) {
      var transformed = sphere(TEMPLATE.targets[name], name);
      var row = document.createElement("tr");
      table.appendChild(row);
      row.appendChild(cell(name));
      row.appendChild(cell(TEMPLATE.targets[name].length, undefined, function () {
        console.log(TEMPLATE.targets[name]);
      }));
      row.appendChild(cell(transformed.length, undefined, function () {
        console.log(transformed);
      }));
      experiments.push(benchmark(transformed, row, {
        source: name,
        target: TEMPLATE.targets[name],
        transformed: transformed
      }));
    });
    document.getElementById("json").value = JSON.stringify(experiments, null, 2);      
  });
}
