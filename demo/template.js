window.addEventListener("load", function () {
  var editors = {};
  // Editors //
  (function () {
    var make = window.ace
      ? function (name, mode) {
        var editor = ace.edit(name+"-editor");
        editor.setTheme("ace/theme/chrome");
        editor.getSession().setMode(mode);
        editor.$blockScrolling = Infinity;
        editor.setOption("showPrintMargin", false);
        editor.getSession().setTabSize(2);
        editor.getSession().setUseSoftTabs(true);
        editors[name] = editor;
      }
      : function (name) {
        var editor = document.getElementById(name+"-editor");
        var textarea = document.createElement("textarea");
        textarea.className = editor.className;
        editor.parentNode.insertBefore(textarea, editor);
        editor.parentNode.removeChild(editor);
        editors[name] = {
          getValue: function () { return textarea.value },
          setValue: function (value) { textarea.value = value }
        }
      };
    make("transpile", "ace/mode/javascript");
    make("logger", "ace/mode/plain_text");
    make("main", "ace/mode/javascript");
    make("transpiled", "ace/mode/javascript");
  } ());
  // Select //
  (function () {
    function select (select, editor, templates) {
      if (!Object.keys(templates).length)
        return select.parentNode.removeChild(select);
      select.onchange = function () {
        templates[editor.__selected__] = editor.getValue();
        editor.setValue(templates[editor.__selected__ = select.value], -1)
      };
      Object.keys(templates).sort().forEach(function (key, index) {
        var option = document.createElement("option");
        option.textContent = key;
        option.value = key;
        if (index === 0) {
          option.selected = true;
          editor.setValue(templates[editor.__selected__ = key], -1)
        }
        select.appendChild(option);
      });
    }
    select(document.getElementById("transpile-select"), editors.transpile, @TRANSPILES);
    select(document.getElementById("main-select"), editors.main, @MAINS);
    editors.main.__selected__ || (editors.main.__selected__ = "main.js");
  } ());
  // Benchmark //
  (function () {
    function benchmark (code, span) {
      try {
        var t1 = performance.now(), r = window.eval(code), t2 = performance.now();
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
    document.getElementById("run-button").onclick = function () {
      editors.logger.setValue("", -1);
      benchmark(editors.main.getValue(), document.getElementById("main-span"));
      var module = {exports:{}};
      try {
        (new Function("module", "global", editors.transpile.getValue()))(module, window);
      } catch (error) {
        alert("Failed to evaluate the transpile: "+error);
        throw error;
      }
      if (typeof module.exports !== "function")
        return alert("The transpiler does not 'module.exports' a function");
      var buffer = [];
      var transpile = module.exports({log: function (data) { buffer.push(data) }});
      try {
        var transpiled = transpile(editors.main.getValue(), editors.main.__selected__);
      } catch (error) {
        alert("Failed to transpile "+editors.main.__selected__+": "+error);
        throw error;
      }
      editors.transpiled.setValue(transpiled, -1);
      benchmark(editors.transpiled.getValue(), document.getElementById("transpiled-span"));
      editors.logger.setValue(buffer.join(""), -1);
    };
  } ());
});