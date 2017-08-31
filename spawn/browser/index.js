
var Events = require("events");
var Once = require("../once.js");

module.exports = function (bpath, receptor) {
  return function (parameter, source, script, callback1) {
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
        if (callback1)
          ocallback1(null, JSON.parse(body));
        else
          interface.emit("close", Number(body), null);
        worker.terminate();
      }
    })).spawn(bpath);
    if (!callback1) {
      var interface = new Events();
      worker.onerror = interface.emit.bind(interface, "error");
      interface.terminate = function (signal) {
        worker.terminate();
        interface.emit("close", null, signal);
      };
      return interface;
    }
    ocallback1 = Once(callback1);
    worker.onerror = ocallback1;
  };
};
