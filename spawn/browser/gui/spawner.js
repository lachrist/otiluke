
var Editor = require("./editor.js");

var prototype = {
  terminate: function () {
    this._child_ && this._child_.terminate();
  }
};

module.exports = function (container, spawn) {
  var self = Object.create(prototype);
  self._child_ = null;
  var input = document.createElement("input");
  var div1 = document.createElement("div");
  var button = document.createElement("button");
  var div2 = document.createElement("div");
  [input, div1, button, div2].forEach(container.appendChild.bind(container));
  var editor = Editor(div1);
  var Terminal = Terminal(div2);
  input.placeholder = "Parameter...";
  function toggle (test) {
    input.disabled = !test;
    editor[test ? "enable" : "disable"]();
    terminal[test ? "disable" : "enable"]();
    button.innerText = test ? "Spawn" : "Terminate";
    button.onclick = test ? start : stop;
  }
  function stop () {
    toggle(true);
    self._child_.terminate();
    self._child_ = null;
  }
  function start () {
    toggle(false);
    self._child_ = spawn(input.value, null, editor.get());
    self._child_.on("error", function (error) {
      stop();
      alert("Spawning error: "+error.message);
      throw error;
    });
    terminal.link(self._child_);
  }
  toggle(true);
  return self;
};
