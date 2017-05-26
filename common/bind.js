
exports.js = function (text, bindings) {
  for (var key in bindings)
    bindings[key] = "var "+key+" = "+bindings[key]+";";
  return bind(/\/\* TEMPLATE ([A-Z_]+) \*\//g, text, bindings);
};

exports.html = function (text, bindings) {
  return bind(/<!-- TEMPLATE ([A-Z_]+) -->/g, text, bindings);
};

function bind (regexp, text, bindings) {
  return text.replace(regexp, function (match, key) {
    return bindings[key] || match;
  });
}
