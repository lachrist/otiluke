// sphere.js //
var namespace = "_otiluke_";
module.exports = function (argument, channel) {
  global[namespace] = function (message) {
    channel.request("POST", "/"+argument, {}, message, true);
  };
  return function (script, source) {
    return [
      namespace+"("+JSON.stringify("before "+source)+");",
      script,
      namespace+"("+JSON.stringify("after "+source)+");",
    ].join("\n");
  };
};