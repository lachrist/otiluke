
var Fs = require("fs");
var Ws = require("ws");
var Url = require("url");
var Path = require("path");
var Http = require("http");
var Stream = require("stream");
var Browserify = require("browserify");
var Collect = require("../common/collect.js");
var Normalize = require("../common/normalize.js");
var SplitRequest = require("../common/split-request.js");
var SplitConnect = require("../common/split-connect.js");

function signal (response, reason, error) {
  response.writeHead(400, reason, {"content-type": "text/plain"});
  response.end(String(error));
}

module.exports = function (options, callback) {
  options = Normalize(options);
  var prefix = Maht.random().toString(36).substring(2);
  options.basedir = options.basedir || process.cwd();
  var server = Http.createServer(SplitRequest(prefix, options.onrequest, function (req, res) {
    var path = Path.join.apply(Path, [options.basedir].concat(Url.parse(req.url).path.split("/")));
    if (/\.js$/.test(path)) {
      Fs.readFileSync(path, "utf8", function (error, target) {
        var virus = options.infect(path);
        if (typeof virus === "string")
          virus = {path:virus, argument:null};
        var readable = new Stream.Readable();
        readable.push("var Virus = require("+JSON.stringify(virus.path)+");\n");
        readable.push("var Emitter = require(\"antena/emitter/browser\");\n");
        readable.push("Virus(Emitter())"); // TODO
        readable.push
        Browserify
        res.end(JSON.stringify({
          
        }));
      });
      return Fs.createReadStream(path).pipe(res);
    }
    Fs.readdir(path, function (error, targets) {
      if (error)
        return signal(res, "cannot collect benchmarks", error);
      Fs.readFile(Path.join(__dirname, "template.html"), "utf8", function (error, html) {
        if (error)
          return signal(res, "cannot find html template", error);
        Fs.readFile(Path.join(__dirname, "template.js"), "utf8", function (error, js) {
          if (error)
            return signal(res, "cannot find js template", error);
          var readable = new Stream.Readable();
          readable.push("var TEMPLATE = "+JSON.stringify({
            prefix: prefix,
            argument: options.virus.argument,
            targets: targets.filter(isjs).sort();
          }, null, 2)+";\n");
          readable.push("TEMPLATE.virus = require("+JSON.stringify(options.virus.path)+");\n");
          readable.push(js);
          readable.push(null);
          Browserify(readable, {basedir:__dirname}).bundle(function (error, buffer) {
            if (error)
              return signal(res, "bundling error", error);
            var bundle = "<script>"+buffer.toString("utf8").replace("</script>", "<\\/script>")+"</script>";
            res.writeHead(200, "ok", {"content-type": "text/html"});
            res.end(html.replace("<!-- TEMPLATE BUNDLE -->", bundle));
          });
        });
      });
    });
  }));
  (new Ws.Server({server:server})).on("connection", SplitConnect(options.prefix, options.onconnect, function (con) {
    con.close(4000, "connection not handled");
  }));
  return server;
};
