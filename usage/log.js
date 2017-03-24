module.exports = function (options) {
  global._hidden_ = options;
  return {
    onscript: function (script, source) {
      var compiled = [
        "_hidden_.send("+JSON.stringify("begin "+source)+");",
        script,
        "_hidden_.send("+JSON.stringify("end "+source)+");"
      ].join("\n");
      options.send(JSON.stringify({
        source: source,
        target: script,
        compiled: compiled
      }, null, 4));
      return compiled;
    },
    onmessage: function (data) {}
  };
};