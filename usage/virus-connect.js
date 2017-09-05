
module.exports = function (parameter, emitter, callback) {
  var con = emitter.connect("/");
  con.on("open", function () {
    global._otiluke_ = con;
    callback(null, function (source, script) {
      return [
        "_otiluke_.send(\"BEGIN \"+"+JSON.stringify(source)+");",
        script,
        "_otiluke_.send(\"END \"+"+JSON.stringify(source)+");",
      ].join("\n");
    });
  });
};
