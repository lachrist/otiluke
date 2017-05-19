
var Fs = require("fs");
var Ws = require("ws");
var Path = require("path");
var Http = require("http");
var Stream = require("stream");
var Browserify = require("browserify");
var Bind = require("../util/bind.js");
var Icon = require("../util/icon.js");
var Collect = require("../util/collect.js");
var Normalize = require("../util/normalize.js");

function signal (response, reason, error) {
  response.writeHead(400, reason, {"content-type": "text/plain"});
  response.end(String(error));
}

module.exports = function (options, callback) {
  options.basedir = options.basedir || process.cwd();
  options.hijack = Normalize.hijack(options.hijack);
  options.sphere = Normalize.sphere(options.sphere);
  var server = Http.createServer(function (req, res) { 
    if (options.hijack.request(req, res))
      return;
    var path = Path.join.apply(Path, [options.basedir].concat(req.url.split("/")));
    Collect(path, function (error, targets) {
      if (error)
        return signal(res, "cannot collect benchmarks", error)
      Fs.readFile(Path.join(__dirname, "template.html"), "utf8", function (error, html) {
        if (error)
          return signal(res, "cannot find html template", error)
        Fs.readFile(Path.join(__dirname, "template.js"), "utf8", function (error, js) {
          if (error)
            return signal(res, "cannot find js template", error)
          Icon(function (error, icon) {
            var readable = new Stream.Readable();
            readable.push(Bind.js(js, {
              TARGETS: JSON.stringify(targets),
              SPHERE_CAST: "require("+JSON.stringify(options.sphere.path.cast)+")",
              SPHERE_SUB: "require("+JSON.stringify(options.sphere.path.sub)+")",
              SPHERE_ARGUMENT: JSON.stringify(options.sphere.argument)
            }));
            readable.push(null);
            Browserify(readable, {basedir:__dirname}).bundle(function (error, buffer) {
              if (error)
                return signal(res, "bundling error", error)
              res.writeHead(200, "ok", {"content-type": "text/html"});
              res.end(Bind.html(html, {
                ICON: icon,
                BUNDLE: "<script>"+buffer.toString("utf8").replace("</script>", "<\\/script>")+"</script>"
              }));
            });
          });
        });
      });
    });
  });
  (new Ws.Server({server: server})).on("connection", options.hijack.socket);
  return server;
};
