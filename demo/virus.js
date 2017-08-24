
module.exports = function (options, callback) {
  OtilukeSocket = options.connect("/"+options.static);
  con.onopen = function () {
    callback(function (source, script) {
      return [
        "OtilukeSocket.send("+JSON.stringify("Begin "+source)+");",
        script,
        "OtilukeSocket.send("+JSON.stringify("After "+source)+");"
      ].join("\n");
    });
  };
};
