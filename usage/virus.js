
module.exports = function (parameter, emitter, callback) {
  var emitters = emitter.split(["begin", "end"]);
  var con = emitters.begin.connect("/");
  con.on("open", function () {
    global._otiluke_begin_con_ = con;
    global._otiluke_end_emitter_ = emitters.end;
    callback(null, function (source, script) {
      return [
        "_otiluke_begin_con_.send("+JSON.stringify(source)+");",
        script,
        "_otiluke_end_emitter_.request(\"GET\", \"/\", {}, "+JSON.stringify(source)+");",
      ].join("\n");
    });
  });
};
