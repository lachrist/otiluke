
exports.now = function () {
  var time = process.hrtime();
  return (1e9*time[0]+time[1]) / 1e6;
};
