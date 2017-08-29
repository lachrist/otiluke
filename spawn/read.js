
module.exports = function (s) {
  if (s === "undefined")
    return undefined;
  if (s === "circular")
    return {};
  return JSON.parse(s);
};
