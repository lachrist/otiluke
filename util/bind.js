
exports.js = function (text, bindings) {
  return bind(/\/\* TEMPLATE ([A-Z_]+) \*\//g, text, bindings);
};

exports.html = function (text, bindings) {
  return bind(/<!-- TEMPLATE ([A-Z_]+) -->/g, text, bindings);
};

function bind (regexp, text, bindings) {
  return text.replace(regexp, function (match, key) {
    if (key in bindings) {
      match = bindings[name];
      delete bindings[name];
    }
    return match;
  });
}
