
exports.begin = function (string, max) {
  return string.length <= max ? string : "..."+string.substring(string.length-max+3);
};

exports.end = function (string, max) {
  return string.length <= max ? string : string.substring(0, max-3);
};
