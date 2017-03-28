
var Truncate = require("../util/truncate.js");

function select (select, editor, templates) {
  if (!Object.keys(templates).length)
    return select.parentNode.removeChild(select);
  select.onchange = function () {
    templates[editor.__selected__] = editor.getValue();
    editor.setValue(templates[editor.__selected__ = select.value], -1)
  };
  Object.keys(templates).sort().forEach(function (key, index) {
    var option = document.createElement("option");
    option.textContent = Truncate.begin(key, 20);
    option.value = key;
    if (index === 0) {
      option.selected = true;
      editor.setValue(templates[editor.__selected__ = key], -1)
    }
    select.appendChild(option);
  });
};

module.exports = function (editors, spheres, targets) {
  select(document.getElementById("sphere-select"), editors.sphere, spheres);
  select(document.getElementById("target-select"), editors.target, targets);
  editors.target.__selected__ || (editors.target.__selected__ = "target.js");
};
