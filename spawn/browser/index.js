var Spawn = require("antena/spawn/browser");

module.exports = function (receptor, vbundle) {
  return function (source, parameter, argv) {
    return Spawn({content:[
      "var Virus = "+vbundle+";",
      "var source = "+JSON.stringify(source)+";",
      "process.argv[1] = source.path;",
      "Virus("+JSON.stringify(parameter)+", process.emitter, function (error, infect) {",
      "  if (error)",
      "    throw error;",
      "  if (source.content)",
      "    return global.eval(infect(source.path, source.content));",
      "  var req = new XMLHttpRequest();",
      "  req.open('GET', source.path)"
      "  req.onload = function () {",
      "    if (req.status !== 200)",
      "      throw new Error('Cannot load '+source.path+': '+req.status+' '+req.statusText);",
      "    global.eval(infect(source.path, source.content));",
      "  };"
      "  req.send();"
    ].join("\n")}, argv, receptor);
  };
};





var Events = require("events");
var Receptor = require("antena/receptor/browser")
var Collect = require("../util/collect.js");
var Events = require("events");

function write (data) { this.emit("data", data) }

module.exports = function (receptor, vurl) {
  return function (source, parameter, argv) {


    var child = new Events();
    child.stdin = new Events();
    child.stdout = new Events();
    child.stderr = new Events();
    child.stdin.write = write;
    var zero = performance.now();
    var worker = new Worker(vurl);
    var handlers = Receptor({}).merge({
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
        onconnect: function (path, con) {
          child.stdin.on("data", con.send.bind(con));
          con.on("message", function (message) {
            if (message.indexOf("out") === 0)
              return child.stdout.emit("data", message.substring(3));
            if (message.indexOf("err") === 0)
              return child.stderr.emit("data", message.substring(3));
            child.kill("Invalid stdio message: "+message);
          });
        }
      }),
      end: Receptor({
        onrequest: function (method, path, headers, body, callback2) {
          terminate(JSON.parse(body), null);
        }
      }),
      virus: receptor
    }).trace().handlers(worker.postMessage.bind(worker));
    worker.onmessage = function (message) {
      handlers.message(message);
    };
    worker.onerror = function (error) {
      child.stderr.emit("data", error instanceof ErrorEvent ? (error.stack || error.message+"\n") : String(error));
    };
    function terminate (code, signal) {
      handlers.terminate();
      child.emit("exit", code, signal);
      child.stdin.on("close", function () {
        child.stdout.on("close", function () {
          child.stderr.on("close", function () {
            child.emit("close", code, signal);
          });
          child.stderr.emit("close");
        });
        child.stdout.emit("close");
      });
      child.stdin.emit("close");
    }
    child.kill = terminate.bind(null, null);
    if (!callback1)
      return child;
    Collect(child, zero, performance, callback);
  };
};
