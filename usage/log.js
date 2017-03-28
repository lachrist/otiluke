// {sphere:string, target:string, send:function, request:function}
module.exports = function (options) {
  global._hidden_ = options;
  return {
    onscript: function (script, source) {
      return [
        "_hidden_.send("+JSON.stringify("begin "+source)+");",
        script,
        "_hidden_.send("+JSON.stringify("end "+source)+");"
      ].join("\n");
    },
    onmessage: function (data) {}
  };
};