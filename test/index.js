
var Fs = require("fs");
var Http = require("http");
var Url = require("url");
var Querystring = require("querystring");

var Ws = require("ws");

var Bundle = require("../util/bundle.js");
var Bind = require("../util/bind.js");
var Icon = require("../util/icon.js");
var Collect = require("../util/collect.js");
var Children = require("../util/children.js");
var Crypto = require("crypto");

module.exports = function (options, callback) {
  var channels = {};
  var server = Http.createServer(function (req, res) {
    var parts = /^\/otiluke([a-f0-9]+)(\/.*)/.exec(req.url);
    if (parts && parts[1] in channels) {
      req.url = parts[2];
      return channels[parts[1]](req, res);
    }
    try {
      var targets = Collect(/\.js$/.test(req.url) ? [process.cwd()+req.url] : Children(process.cwd()+req.url, /\.js$/));
    } catch (error) {
      res.writeHead(404, {"Content-Type": "text/plain"});
      return res.end(error.message);
    }
    var splitter = Crypto.randomByte(64).toString("hex");
    Bundle(Bind.js(Fs.readFileSync(__dirname+"/template.js", "utf8"), {
      SPLITTER: "var SPLITTER = "+JSON.stringify(splitter)+";\n",
      SPHERES: "var SPHERES = {\n"+options.spheres.map(function (sphere) {
        return "  "+JSON.stringify(sphere)+": require("+JSON.stringify(sphere)+")";
      }).join(",\n")+"\n};\n",
      TARGETS: "var TARGETS = "+JSON.stringify(targets, null, 2)+";\n"
    }), __dirname, [], function (bundle) {
      res.writeHead(200, {"Content-Type":"text/html"});
      res.end(Bind.html(Fs.readFileSync(__dirname+"/template.html", "utf8"), {
        ICON: "<link rel=\"icon\" href="+Icon+">",
        BUNDLE: "<script>"+bundle+"</script>"
      }));
    });
  });
  Ws.Server({server:server}).on("connection", function (ws) {
    var query = Querystring.parse(Url.parse(ws.upgradeReq.url).query);
    channels[splitter] = options.channel({
      sphere: query.sphere,
      target: query.target,
      socket: ws
    });
  });
  server.listen(options.port, function () {
    process.stdout.write("Serving "+process.cwd()+" to localhost:"+server.address().port+"\n");
  });
};
