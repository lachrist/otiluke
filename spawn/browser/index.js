
var Once = require("../once.js");

module.exports = function (bpath, receptor) {
  return function (parameter, source, script, callback1) {
    callback1 = Once(callback1);
    var worker = receptor.merge("/otiluke-webworker-begin", Receptor({
      onrequest: function (method, path, headers, body, callback2) {
        callback2(200, "ok", {}, JSON.stringify({
          autoclose: Boolean(callback1),
          parameter: parameter,
          source: source,
          script: script
        }));
      }
    })).merge("/otiluke-webworker-end", Receptor({
      onrequest: function (method, path, headers, body, callback2) {
        callback1(null, JSON.parse(body));
        callback2(200, "ok", {}, "");
      }
    })).spawn(bpath);
    if (!callback)
      return worker;
    worker.onerror = callback1;
    return worker;
  };
};
