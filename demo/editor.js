
if (global.ace) {
  module.exports = function (name, mode) {
    var editor = ace.edit(name+"-editor");
    editor.setTheme("ace/theme/chrome");
    editor.getSession().setMode(mode);
    editor.$blockScrolling = Infinity;
    editor.setOption("showPrintMargin", false);
    editor.getSession().setTabSize(2);
    editor.getSession().setUseSoftTabs(true);
    return {
      get: function () { return editor.getValue() },
      set: function (content) { return editor.setValue(content, -1) }
    };
  };
} else {
  module.exports = function (name) {
    var editor = document.getElementById(name+"-editor");
    var textarea = document.createElement("textarea");
    textarea.className = editor.className;
    editor.parentNode.insertBefore(textarea, editor);
    editor.parentNode.removeChild(editor);
    return {
      get: function () { return textarea.value },
      set: function (content) { textarea.value = content }
    }
  };
}
