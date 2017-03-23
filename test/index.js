
var Fs = require("fs");
var Http = require("http");
var Stream = require("stream");
var Url = require("url");
var Querystring = require("querystring");

var Ws = require("ws");
var Browserify = require("browserify");

var Icon = require("../util/icon.js");
var Collect = require("../util/collect.js");

// options : {
//   comps: [
//     "path/to/transpile1.js",
//     "path/to/transpile2.js",
//   ],
//   channel: function (transpile, main) {
//     return {
//       onrequest: function (req, res) { ... },
//       onsocket: function (socket) { ... },
//   },
//   port: 8080
// }

module.exports = function (options) {
  var onrequests = [];
  var server = Http.createServer(function (req, res) {
    var parts = /^\/otiluke([0-9]+)(\/.*)/.test(req.url);
    if (parts) {
      req.url = parts[2];
      return onrequests[parts[1]](req, res);
    }
    try {
      var mains = Collect(process.cwd()+req.url, /\.js$/);
    } catch (error) {
      res.writeHead(404, {"Content-Type": "text/plain"});
      return res.end(error.message);
    }
    var readable = new Stream.Readable();
    readable.push("var COMPS = {\n"+options.comps.map(function (comp) {
      return "  "+JSON.stringify(comp)+": require("+JSON.stringify(comp)+")";
    }).join(",\n")+"\n};\n");
    readable.push("var MAINS = "+JSON.stringify(mains, null, 2)+";\n");
    readable.push(Fs.readFileSync(__dirname+"/template.js", "utf8"));
    readable.push(null);
    Browserify(readable, {basedir:__dirname}).bundle(function (error, bundle) {
      if (error)
        throw error;
      res.writeHead(200, {"Content-Type":"text/html"});
      res.end(Bind(Fs.readFileSync(__dirname+"/template.html", "utf8"), {
        "@ICON": Icon,
        "@BUNDLE": bundle.toString("utf8").replace(/<\/script>/gi, function () { return "<\\/script>" })
      }));
    });
  });
  Ws.Server({server:server}).on("connection", function (ws) {
    var query = Querystring.parse(Url.parse(ws.upgradeUrl).query);
    var channel = options.channel(query.comp, query.main);
    var i = 0;
    while (onrequests[i])
      i++;
    onrequests[i] = channel.onrequests;
    ws.send("otiluke"+i);
    ws.on("close", function () { delete onrequests[i] });
    channel.onsocket(ws);
  });
  server.listen(options.port || 0, function () {
    process.stdout.write("Serving "+process.cwd()+" to localhost:"+server.address().port+"\n");
  });
};
