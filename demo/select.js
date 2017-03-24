
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
};

module.exports = function (editors, mains, comps) {
  select(document.getElementById("compiler-select"), editors.compiler, comps);
  select(document.getElementById("main-select"), editors.main, mains);
  editors.main.__selected__ || (editors.main.__selected__ = "main.js");
};
