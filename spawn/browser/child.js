// node child.js vpath parameter source 
var Fs = require("fs");

process.on("message", function (message) {
  process.removeAllListeners("message");
  process.argv[1] = message.source.path;
  var Virus = require(message.vpath);
  Virus(message.parameter, process.emitter, function (error, infect) {
    if (error)
      throw error;
    
    global.eval(infect(message.source.path, message.source.content || Fs.readFileSync(message.source.path, "utf8")));
  });
});





var EmitterWebworker = require("antena/emitter/webworker");
var Events = require("events");

var emitters = EmitterWebworker().split(["begin", "stdio", "end", "virus"]);

var con = emitters.stdio.connect("/");
con.on("open", function () {
  emitters.begin.request("GET", "/", {}, "", function (error, status, reason, header, body) {
    if (error)
      throw error;
    var mock = {
      stdin: new Events(),
      stdout: new Events(),
      stderr: new Events(),
      exit: function (code) {
        emitters.end.request("GET", "/", {}, JSON.stringify(code), function () {});
      }
    }
    global.process = mock;
    con.on("message", mock.stdin.emit.bind(mock.stdin, "data"));
    mock.stdout.write = function (string) { con.send("out"+string) };
    mock.stderr.write = function (string) { con.send("err"+string) };
    global.console = {
      log: function () {
        var args = [];
        for (var i=0; i<arguments.length; i++)
          args.push(""+arguments[i]);
        con.send("out"+args.join(" ")+"\n");
      }
    };
    var body = JSON.parse(body);
    OTILUKE_VIRUS(body.parameter, emitters.virus, function (error, infect) {
      function onload (script) {
        global.eval(infect(body.source, body.script));
        body.autoclose && mock.exit(0);
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
