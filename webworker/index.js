
module.exports = function (path, receptor, parameter, source, script) {
  return receptor.merge("/otiluke-webworker", Receptor({
    onrequest: function (method, path, headers, body, callback) {
      callback(200, "ok", {}, JSON.stringify({
        parameter: parameter,
        source: source,
        script: script
      }));
    }
  })).spawn(path);
};
