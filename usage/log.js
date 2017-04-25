module.exports = function (request, WebSocket, options) {
  global._hidden_log_ = function (message) {
    request("POST", options.url, "/foo", {}, options.target+" >> "+message+"\n");
  }
  return function (script, source) {
    return [
      "_hidden_log_("+JSON.stringify("begin "+source)+");",
      script,
      "_hidden_log_("+JSON.stringify("end "+source)+");"
    ].join("\n");
  };
};