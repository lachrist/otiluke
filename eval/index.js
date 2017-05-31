
var Fs = require("fs");
var Ws = require("ws");
var Url = require("url");
var Path = require("path");
var Http = require("http");
var Stream = require("stream");
var Browserify = require("browserify");
var Collect = require("../common/collect.js");
var Normalize = require("../common/normalize.js");

function signal (response, reason, error) {
  response.writeHead(400, reason, {"content-type": "text/plain"});
  response.end(String(error));
}

module.exports = function (options, callback) {
  options = Normalize(options);
  options.basedir = options.basedir || process.cwd();
  var server = Http.createServer(function (req, res) {
    if (options.intercept.request(req, res))
      return;
    var path = Path.join.apply(Path, [options.basedir].concat(Url.parse(req.url).path.split("/")));
    Collect(path, function (error, targets) {
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
            sphere: options.sphere,
            targets: targets
          }, null, 2)+";\n");
          readable.push("TEMPLATE.sphere.module = require("+JSON.stringify(options.sphere.path)+");\n");
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
  });
  (new Ws.Server({server:server})).on("connection", function (ws) {
    if (options.intercept.connect(ws))
      return;
    ws.close(4000, "connect not intercepted");
  });
  return server;
};
