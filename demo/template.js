
var transforms = @TRANSFORMS;

var JsBeautify = require('js-beautify').js_beautify;
var Print = require("../util/print.js");

var editors = {};
var make = function (name) {
  var editor = document.getElementById(name + "-editor");
  var textarea = document.createElement("textarea");
  textarea.className = editor.className;
  editor.parentNode.insertBefore(textarea, editor);
  editor.parentNode.removeChild(editor);
  editors[name] = {
    getValue: function () { return textarea.value },
    setValue: function (value) { textarea.value = value }
  }
};
window.ace && (make = function (name) {
  var editor = ace.edit(name+"-editor");
  editor.setTheme("ace/theme/chrome");
  editor.getSession().setMode("ace/mode/javascript");
  editor.$blockScrolling = Infinity;
  editor.setOption("showPrintMargin", false);
  editor.getSession().setTabSize(2);
  editor.getSession().setUseSoftTabs(true);
  editors[name] = editor;
});

function benchmark (code, result, error, time) {
  try {
    var t1 = performance.now(), r = window.eval(code), t2 = performance.now();
    document.getElementById(result).textContent = Print(r);
  } catch (e) {
    t2 = performance.now();
    document.getElementById(error).textContent = Print(e);
  } finally {
    document.getElementById(time).textContent = (t2 - t1 <= 1) ? "< 1ms" : Math.ceil(t2 - t1) + "ms";
  }
}

window.addEventListener("load", function () {
  var logger = document.getElementById("logger");
  console.log = function (msg) { logger.value = logger.value + msg + "\n" };
});

window.addEventListener("load", function () {
  ["transform", "target", "transformed"].forEach(make);
  var select = document.getElementById("transform-select");
  select.onchange = function () { editors.transform.setValue(transforms[select.value], -1) };
  Object.keys(transforms).sort().forEach(function (key, idx) {
    var option = document.createElement("option");
    option.textContent = key;
    option.value = key;
    idx || (option.selected = true);
    select.appendChild(option);
  });
  select.onchange();
});

window.addEventListener("load", function () {
  document.getElementById("run-button").onclick = function () {
    benchmark(editors.target.getValue(), "target-result-span", "target-error-span", "target-time-span");
    var module = {};
    try { (new Function("module", "global", editors.transform.getValue()))(module, window) }
    catch (error) { return console.log("Failed to evaluate the transform module: " + error) }
    if (typeof module.exports !== "function")
      return console.log("The transform module does not 'module.exports' a function");
    try { var transformed = module.exports(editors.target.getValue(), "target.js") }
    catch (error) { return console.log("Failed to transform the target: " + error) }
    editors.transformed.setValue(JsBeautify(transformed), -1);
    benchmark(editors.transformed.getValue(), "transformed-result-span", "transformed-error-span", "transformed-time-span");
  };
});
