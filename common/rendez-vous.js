
module.exports = function (counter, result, callback) {
  if (counter === 0)
    return callback(null, []);
  var error = null;
  return function (combine) {
    return function (e, x) {
      if (e) {
        error = e;
      } else {
        combine(x, result);
      }
      if ((--counter) === 0) {
        callback(error, result);
      }
    };
  };
};