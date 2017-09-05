
var Events = require("events");
var ReceptorMerge = require("antena/receptor/merge");
var Once = require("../once.js");
var Stream = require("stream");
var Events = require("events");
var BundledClient = require("./bundled-client.js");

module.exports = function (receptor, vurl, require) {
  vurl = typeof require !== "string" ? vurl : URL.createObjectURL(new Blob([
    "var VIRUS = (function () {\n",
    "  "+require+"\n",
    "  var module = {exports:{}}\n;",
    "  var exports = module.exports;\n",
    "  "+vurl+"\n",
    "  return module.exports;\n",
    "} ());\n",
    BundledClient
  ], {type: "application/javascript"}));
  return function (parameter, source, script, callback1) {
    var worker = ReceptorMerge({
      begin: Receptor({
        onrequest: function (method, path, headers, body, callback2) {
          callback2(200, "ok", {}, JSON.stringify({
            autoclose: Boolean(callback1),
            parameter: parameter,
            source: source,
            script: script
          }));
        }
      }),
      stdio: Receptor({
        connect: function (path, con) {
          child.stdin.on("data", con.send.bind(con));
          con.on("message", function (message) {
            if (message.indexOf("out"))
              return child.stdout.push(message.substring(3));
            if (message.indexOf("err"))
              return child.stderr.push(message.substring(3));
            child.kill("Invalid stdio message: "+message);
          });
        }
      }),
      end: Receptor({
        onrequest: function (method, path, headers, body, callback2) {
          terminate(JSON.parse(body), null);
        }
      }),
    }).spawn(vurl);
    worker.onerror = function (error) {
      if (error instanceof Error)
        child.stderr.push(error.stack);
      child.stderr.error();
    };
    var child = new Events();
    child.stdin = new Stream.Readable();
    child.stdout = new Stream.Readable();
    child.stderr = new Stream.Readable();
    function terminate (code, signal) {
      worker.terminate();
      child.emit("exit", code, signal);
      child.stdout.push(null);
      child.stdout.on("close", function () {
        child.stderr.push(null);
        child.stderr.on("close", function () {
          child.emit("close", code, signal);
        });
      });
    }
    child.kill = terminate.bind(null, null);


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
