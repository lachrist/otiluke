
module.exports = function (x) {
  if (x.type === "undefined")
    return undefined;
  if (x.type === "error") {
    var e = new Error();
    e.name = x.name;
    e.message = x.message;
    e.stack = x.stack;
    return e;
  }
  return x.inner;
};
