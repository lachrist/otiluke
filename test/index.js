
var Fs = require("fs");
var Bind = require("../util/bind.js");
var Icon = require("../util/icon.js");

function load (paths, callback) {
  if (paths.length === 0)
    callback(null);
  var lasterror = null;
  var loads = [];
  paths.forEach(function (path) {
    Fs.readFile(path, "utf8", function (error, content) {
      lasterror = error || lasterror;
      loads.push({path:path, content:content});
      if (loads.length === paths.length) {
        callback(lasterror, loads);
      }
    });
  });
}

module.exports = function (spheres, targets, callback) {
  if (!Array.isArray(spheres))
    spheres = [spheres];
  if (!Array.isArray(targets))
    targets = [targets];
  load(targets, function (error, bindings) {
    if (error)
      return callback(error);
    Fs.readFile(__dirname+"/template.js", "utf8", function (error, content) {
      if (error)
        return callback(error);
      var readable = new Stream.Readable();
      readable.push(Bind.js(content, {
        TARGETS: "var TARGETS = "+JSON.stringify(bindings)+";",
        SPHERES: "var SPHERES = ["+spheres.map(function (sphere) {
          sphere = typeof sphere === "string" ? {path:sphere,options:null} : sphere;
          return "{make:require("+JSON.stringify(Path.resolve(sphere.path))+"),options:"+JSON.stringify(sphere.options)+"}"
        }.join(","))+"];"
      }));
      readable.push(null);
      var browserify = Browserify(readable, {basedir:__dirname});
      browserify.bundle(function (error, buffer) {
        Fs.readFile(__dirname+);
        Fs.readFile(__dirname+"/template.html", "utf8", function (error, content) {
          if (error)
            return callback(error);
          callback(null, Bind.html(content, {
            ICON: "<link rel=\"icon\" href="+Icon+">",
            BUNDLE: "<script>"+bundle+"</script>"
          }));
        });
      });
    });
  })
};

  var Stream = require("stream");
  var Browserify = require("browserify");
  var Resolve = require("resolve");

  // Tried to remove the dependency with Resolve without success:
  // Source: https://github.com/nodejs/node/blob/v5.10.0/lib/module.js
  //         https://github.com/nodejs/node/blob/v5.10.0/lib/internal/module.js
  // require("module")._resolveFilename(module, {paths:[basedir]})
  // Remark: used eval instead of JSON.parse to handle single quoted strings
  module.exports = function (content, basedir, dependencies, callback) {
    var readable = new Stream.Readable();
    readable.push(content, "utf8");
    readable.push(null);
    var browserify = Browserify(readable, {basedir:basedir});
    dependencies.forEach(function (dep) {
      browserify.require(Resolve.sync(global.eval(dep.name), {basedir:dep.basedir}), {expose:dep.name});
    });
    browserify.bundle(function (error, buffer) {
      callback(error, error || buffer.toString("utf8").replace(/\<\/script\>/g, "<\\/script>"));
    });
  };



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
