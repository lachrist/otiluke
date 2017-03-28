function make (name) {
  var editor = document.getElementById(name+"-editor");
  var textarea = document.createElement("textarea");
  textarea.className = editor.className;
  editor.parentNode.insertBefore(textarea, editor);
  editor.parentNode.removeChild(editor);
  return {
    getValue: function () { return textarea.value },
    setValue: function (value) { textarea.value = value }
  }
};

if (global.ace) {
  make = function (name, mode) {
    var editor = ace.edit(name+"-editor");
    editor.setTheme("ace/theme/chrome");
    editor.getSession().setMode(mode);
    editor.$blockScrolling = Infinity;
    editor.setOption("showPrintMargin", false);
    editor.getSession().setTabSize(2);
    editor.getSession().setUseSoftTabs(true);
    return editor;
  };
}

module.exports = function () {
  var editors = {};
  editors.sphere = make("sphere", "ace/mode/javascript");
  editors.socket = make("socket", "ace/mode/plain_text");
  editors.target = make("target", "ace/mode/javascript");
  editors.transpiled = make("transpiled", "ace/mode/javascript");
  return editors;
};
