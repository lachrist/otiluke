
module.exports = function (base, exponent) {
  var result = 1;
  while (exponent) {
    result *= base;
    exponent--;
  }
  return result;
};
