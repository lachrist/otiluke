
module.exports = function (callback) {
  return function (error, result) {
    if (error)
      throw error;
    callback(result);
  } 
}
