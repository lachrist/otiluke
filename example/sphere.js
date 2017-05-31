module.exports = function (argument, channel, callback) {
  global.OtilukeSocket = channel.connect("/"+argument);
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