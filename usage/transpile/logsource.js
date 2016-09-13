module.exports = function (options) {
  global._hidden_ = options.log;
  return function (script, source) {
    options.log("TRANSPILING "+source+"\n");
    return [
      "_hidden_("+JSON.stringify(">> "+source+"\n")+");",
      script,
      "_hidden_("+JSON.stringify("<< "+source+"\n")+");",
    ].join("\n");
  };
};