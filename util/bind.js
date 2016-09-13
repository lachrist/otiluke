
module.exports = function (template, bindings) {
  return template.replace(/@[A-Z]+/g, function (match) {
    if (match in bindings)
      return bindings[match];
    throw new Error("Unknwon variable in template: "+match);
  });
};
