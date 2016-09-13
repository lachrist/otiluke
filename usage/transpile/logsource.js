module.exports = function (options) {
  global.__hidden_log__ = options.log;
  return function (script, source) {
    options.log("TRANSPILING "+source+"\n");
    return [
      "__hidden_log__("+JSON.stringify("BEGIN "+source+"\n")+");",
      script,
      "__hidden_log__("+JSON.stringify("END "+source+"\n")+");",
    ].join("\n");
  };
};