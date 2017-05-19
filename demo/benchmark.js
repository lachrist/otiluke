
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
    editors.logger.set("");
    run(editors.target.get(), document.getElementById("target-span"));
    var module = {exports:{}};
    try {
      (new Function("module", "global", editors.lsphere.get()))(module, window);
    } catch (error) {
      alert("Failed to evaluate the log sphere: "+error);
      throw error;
    }
    if (typeof module.exports !== "function")
      return alert("The log sphere does not 'module.exports' a function");
    var buffer = [];
    var transpile = module.exports(Array.prototype.push.bind(buffer));
    try {
      var transpiled = transpile(editors.target.get(), editors.target.source);
    } catch (error) {
      alert("Failed to transpile "+editors.target.source+": "+error);
      throw error;
    }
    editors.transpiled.set(transpiled);
    run(transpiled, document.getElementById("transpiled-span"));
    editors.logger.set(buffer.join(""));
  };
};
