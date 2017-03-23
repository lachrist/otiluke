var MockRequest = require("../request/mock.js");
var Clear = require("./clear.js");

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
  var socket = {
    send: function (data) {
      if (this._closed_)
        throw new Error("Cannot send data to closed socket")
      editors.socket.setValue(editors.socket.getValue()+">> "+data.replace("\n", "\\n")+"\n");
    },
    close: function (code, reason) {
      if (this._closed_)
        throw new Error("Socket already closed")
      this._closed_ = true;
      this.onclose({code:code, reason, wasClean:true});
    }
  };
  document.getElementById("send-button").disabled = true;
  document.getElementById("send-button").onclick = function () {
    var data = editors.console.getValue();
    editors.console.setValue("", -1);
    editors.socket.setValue(editors.socket.getValue()+"<< "+data.replace("\n", "\\n")+"\n");
    socket.onmessage(data);
  };
  document.getElementById("run-button").onclick = function () {
    document.getElementById("send-button").disabled = false;
    socket._closed_ = false;
    socket.onmessage = function () {};
    socket.onclose = function () {};
    editors.socket.setValue("", -1);
    editors.console.setValue("", -1);
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
    var compile = module.exports({socket:socket, request:MockRequest()});
    try {
      var compiled = compile(editors.main.getValue(), editors.main.__selected__);
    } catch (error) {
      alert("Failed to compile "+editors.main.__selected__+": "+error);
      throw error;
    }
    editors.compiled.setValue(compiled, -1);
    benchmark(editors.compiled.getValue(), document.getElementById("compiled-span"));
  };
};
