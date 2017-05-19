// log-sphere.js //
var namespace = "_hidden_log_";
module.exports = function (log) {
  global[namespace] = log;
  return function (script, source) {
    return [
      namespace+"("+JSON.stringify("before "+source+"\n")+");",
      script,
      namespace+"("+JSON.stringify("after "+source+"\n")+");"
    ].join("\n");
  };
};