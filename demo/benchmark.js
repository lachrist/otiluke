var MockRequest = require("../request/mock.js");

function benchmark (code, span) {
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
  document.getElementById("run-button").onclick = function () {
    document.getElementById("send-button").disabled = false;
    editors.socket.setValue("", -1);
    benchmark(editors.main.getValue(), document.getElementById("main-span"));
    var module = {exports:{}};
    try {
      (new Function("module", "global", editors.compile.getValue()))(module, window);
    } catch (error) {
      alert("Failed to evaluate the compiler: "+error);
      throw error;
    }
    if (typeof module.exports !== "function")
      return alert("The compiler does not 'module.exports' a function");
    var buffer;
    var compile = module.exports({
      socket: {
        send: function (data) { buffer.push(data) },
        close: function () {}
      },
      request: Request(location.href)
    });
    try {
      var compiled = compile(editors.main.getValue(), editors.main.__selected__);
    } catch (error) {
      alert("Failed to compile "+editors.main.__selected__+": "+error);
      throw error;
    }
    editors.compiled.setValue(compiled, -1);
    benchmark(editors.compiled.getValue(), document.getElementById("compiled-span"));
    editors.socket.setValue(buffer.map("\n", "\\n").join("\n"));
  };
};
