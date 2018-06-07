
module.exports = function (parameter, emitter, callback) {
  global._otiluke_ = emitter;
  callback(null, function (source, script) {
    return [
      "_otiluke_.request(\"GET\", \"/\", {}, \"BEGIN \"+"+JSON.stringify(source)+", function () {});",
      script,
      "_otiluke_.request(\"GET\", \"/\", {}, \"END \"+"+JSON.stringify(source)+", function () {});",
    ].join("\n");
  });
};