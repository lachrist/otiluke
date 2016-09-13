
var Fs = require("fs");
var Path = require("path");
var Http = require("http");
var Stream = require("stream");

var Ws = require("ws");

var Icon = require("../util/icon.js");
var Childeren = require("../util/children.js");
var Collect = require("../util/collect.js");
var Browserify = require("browserify");
var Assume = require("../util/assume.js");
var Log = require("../util/log.js");
var Bind = require("../util/bind.js");

module.exports = function (options) {
  var log = Log(options.log);
  var server = Http.createServer(function (request, response) {
    try {
      var mains = Collect(process.cwd()+request.url, /\.js$/);
    } catch (error) {
      response.writeHead(404, {"Content-Type": "text/plain"});
      return response.end(error.message);
    }
    var readable = new Stream.Readable();
    readable.push(Bind(Fs.readFileSync(__dirname+"/template.js", "utf8"), {
      "@TRANSPILES": "{\n"+Childeren(options.transpile, /\.js$/).map(function (transpile) {
        return "  "+JSON.stringify(Path.basename(transpile))+": require("+JSON.stringify(transpile)+")";
      }).join(",\n")+"\n}",
      "@MAINS": JSON.stringify(mains, null, 2)
    }));
    readable.push(null);
    Browserify(readable, {basedir:__dirname}).bundle(Assume(function (bundle) {
      response.writeHead(200, {"Content-Type":"text/html"});
      response.end(Bind(Fs.readFileSync(__dirname+"/template.html", "utf8"), {
        "@ICON": Icon,
        "@TITLE": "Test "+options.transpile,
        "@BUNDLE": bundle.toString("utf8").replace(/<\/script>/gi, function () { return "<\\/script>" })
      }));
    }));
  });
  Ws.Server({server:server}).on("connection", function (ws) {
    ws.on("message", log(ws.upgradeReq.url));
  });
  server.listen(options.port || 0, function () {
    process.stdout.write("Serving localhost:"+server.address().port+" from: "+process.cwd()+"\n");
  });
};
