var Request = require("../util/request/mock.js");

function run (code, span) {
  try {
    var t1 = performance.now(), r = global.eval(code), t2 = performance.now();
    span.style.color = "green";
    span.textContent = (typeof r === "string") ? JSON.stringify(r) : (""+r);
  } catch (e) {
    t2 = performance.now();
    span.style.color = "red";
    span.textContent = ""+e;
  } finally {
    span.textContent += (t2 - t1 <= 1) ? " [< 1ms]" : " ["+Math.ceil(t2 - t1)+"ms]";
  }
}

module.exports = function (editors) {
  return function () {
    editors.socket.setValue("", -1);
    run(editors.target.getValue(), document.getElementById("target-span"));
    var module = {exports:{}};
    try {
      (new Function("module", "global", editors.sphere.getValue()))(module, window);
    } catch (error) {
      alert("Failed to evaluate the sphere: "+error);
      throw error;
    }
    if (typeof module.exports !== "function")
      return alert("The sphere does not 'module.exports' a function");
    var buffer = [];
    var sphere = module.exports({
      sphere: editors.sphere.__selected__,
      target: editors.target.__selected__,
      send: function (data) { buffer.push(data.replace("\n", "\\n")) },
      request: Request(location.href)
    });
    try {
      var transpiled = sphere.onscript(editors.target.getValue(), editors.target.__selected__);
    } catch (error) {
      alert("Failed to transpile "+editors.target.__selected__+": "+error);
      throw error;
    }
    editors.transpiled.setValue(transpiled, -1);
    run(transpiled, document.getElementById("transpiled-span"));
    editors.socket.setValue(buffer.join("\n"));
  };
};
