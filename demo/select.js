
module.exports = function (select, editor, files) {
  if (!Object.keys(files).length)
    return select.parentNode.removeChild(select);
  function load (name) {
    editor.source = name;
    editor.set(files[name]);
  }
  select.onchange = function () {
    files[editor.source] = editor.get();
    load(select.value);
  };
  Object.keys(files).sort().forEach(function (name, index) {
    var option = document.createElement("option");
    option.textContent = name;
    option.value = name;
    select.appendChild(option);
    if (index === 0) {
      option.selected = index === 0;
      load(name);
    }
  });
};
