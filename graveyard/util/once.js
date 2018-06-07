
module.exports = function (f) {
  return function () {
    var g = f;
    f = function () {};
    return g.apply(this, arguments);
  };
};
