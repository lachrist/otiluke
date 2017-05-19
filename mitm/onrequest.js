
var Https = require("https");
var Http = require("http");
var Url = require("url");
var Stream = require("stream");
var Browserify = require("browserify");

module.exports = function (options) {
  var setup = "<script>alert(\"Not bundled yet, wait a bit...\");</script>";
  var readable = new Stream.Readable();
  readable.push([
    "if (!global."+options.namespace+") {",
    "  var Channel = require(\"channel-uniform/browser\");",
    "  var Sub = require("+JSON.stringify(options.sphere.path.sub)+");",
    "  var Cast = require("+JSON.stringify(options.sphere.path.cast)+");",
    "  var Sphere = Cast(Sub);",
    "  global."+options.namespace+" = Sphere("+JSON.stringify(options.sphere.argument)+", Channel(location.host, location.protocol === 'https:'));",
    "}"
  ].join("\n"));
  readable.push(null);
  var browserify = Browserify(readable, {basedir:__dirname});
  browserify.bundle(function (error, bundle) {
    if (error) {
      setup ="<script>alert(\"Bundling error: \""+JSON.stringify(String(error))+");</script>"
    } else {
      setup = "<script>"+bundle.toString("utf8").replace("</script>", "<\\/script>")+"</script>";
    }
  });
  function onjs (js, source) {
    return "eval("+options.namespace+"("+JSON.stringify(js)+","+JSON.stringify(source)+"));";
  }
  function onhtml (html, source) {
    return setup+html.replace(/(<script[^>]*>)([\s\S]*?)(<\/script>)/gi, function (match, p1, p2, p3, offset) {
      return (/^<script[\s\S]*?src[\s]*?=[\s\S]*?>$/i.test(p1)) ? match : p1+onjs(p2, source+"#"+offset)+p3;
    });
  }
  return function (host, req1, res1) {
    if (!options.hijack.request(req1, res1)) {
      var parts = Url.parse(req1.url);
      parts.method = req1.method;
      parts.hostname = host.split(":")[0];
      parts.port = host.split(":")[1];
      parts.headers = req1.headers;
      parts.headers["accept-encoding"] = "identity";
      parts.headers["accept-charset"] = "UTF-8";
      var req2 = (req1.socket.encrypted ? Https : Http).request(parts, function (res2) {
        var isjs = (res2.headers["content-type"]||"").indexOf("javascript") !== -1;
        var ishtml = (res2.headers["content-type"]||"").indexOf("html") !== -1;
        if (isjs || ishtml)
          delete res2.headers["content-length"];
        res1.writeHead(res2.statusCode, res2.statusMessage, res2.headers);
        if (!isjs && !ishtml)
          return res2.pipe(res1);
        var body = "";
        res2.on("data", function (data) { body += data });
        res2.on("end", function () {
          res1.end((isjs?onjs:onhtml)(body, req1.url));
        });
      });
      req1.pipe(req2);
    }
  };
};
