
module.exports = function (LogSphere) {
  return function (splitter, channel) {
    return LogSphere(function (data) {
      channel.request("POST", "/"+splitter, {}, data, true);
    });
  }
};
