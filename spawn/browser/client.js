
var EmitterWebworker = require("antena/emitter/webworker");
var Events = require("events");

var emitters = EmitterWebworker().split(["begin", "stdio", "end"]);
var con = emitters.stdio.connect("/");
con.on("open", function () {
  emitters.begin.request("GET", "/", {}, "", function (status, reason, header, body) {
    global.process = {
      stdin: new Events(),
      stdout: new Events(),
      stderr: new Events(),
      exit: function (code) {
        emitters.end.request("GET", "/", {}, JSON.stringify(code), function () {});
      }
    };
    con.on("message", process.stdin.emit.bind(process.stdin, "data"));
    process.stdout.write = function (string) { con.write("err"+string) };
    process.stderr.write = function (string) { con.write("out"+string) };
    global.console = {
      log: function () {
        var args = [];
        for (var i=0; i<arguments.length; i++)
          args.push(""+arguments[i]);
        con.send("out"+args.join(" ")+"\n");
      }
    };
    var body = JSON.parse(body);
    OTILUKE_VIRUS(body.parameter, emitter, function (error, infect) {
      function onload (script) {
        global.eval(infect(body.source, body.script));
        body.autoclose && process.exit(0);
      }
      if (error)
        throw error;
      if ("script" in body)
        return onload(body.script);
      var req = new XMLHttpRequest();
      req.open("GET", source);
      req.onload = function () {
        if (req.status !== 200)
          throw new Error("Cannot load "+source+": "+req.status+" "+req.statusText);
        onload(req.responseText);
      };
      req.send();
    });
  });
});
