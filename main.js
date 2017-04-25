
var Path = require("path");
var Fs = require("fs");

var Node = require("./node");
var Test = require("./test");
var Demo = require("./demo");
// var Mitm = require("./mitm");

function collect (x, xs) {
  if (typeof x === "string")
    return [x];
  if (Array.isArray(xs))
    return xs;
  if (typeof xs === "string")
    return Fs.readdirSync(xs)
      .filter(function (x) { return /\.js$/.test(x) })
      .map(function (x) { return Path.resolve(xs+"/"+x) });
  throw new Error("Cannot collect: "+xs);
}

exports.test = function (options) {
  return Test({
    spheres: collect(options.sphere, options.spheres),
    channel: options.channel,
    port: Number(options.port) || 0,
  });
};

exports.node = Node;

// exports.node = function (options, callback) {
//   return Node({
//     sphere: options.sphere,
//     target: options.target,
//     "sphere-options": options[""]
//     channel: options.channel
//   }, callback);
// };

exports.demo = function (options) {
  var spheres = collect(options.sphere, options.spheres);
  if (!spheres.length) {
    var basedir = "/"
  } else {
    var basedir = Path.dirname(spheres[0]);
    for (var i=1; i<spheres[i]; i++)
      if (basedir !== Path.dirname(spheres[0]))
        throw new Error("Spheres should share the same directory");
  }
  return Demo({
    spheres: spheres,
    targets: collect(options.target, options.targets),
    out: options.out,
    basedir: basedir
  });
};

exports.mitm = function (options) {
  return Mitm({
    sphere: options.sphere,
    channel: options.channel,
    port: Number(options.port) || 0
  });
};
