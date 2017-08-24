module.exports = function (options, callback) {
  OtilukeSocket = options.connect();
  OtilukeSocket.onopen = function () {
    callback(function (script, source) {
      return [
        "OtilukeSocket.send("+JSON.stringify("before "+source)+");",
        script,
        "OtilukeSocket.send("+JSON.stringify("after "+source)+");",
      ].join("\n");
    });
  };
};