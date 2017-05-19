
var Path = require("path");

function none () { return false }
exports.hijack = function (hijack) {
  hijack = hijack|| {}
  return {
    request: hijack.request || none,
    socket: hijack.socket || none
  };
};

function make (argument, sub, cast) {
  return {
    argument:argument || null,
    path: {
      sub: Path.resolve(sub),
      cast: cast || Path.join(__dirname, "..", "subsphere", "cast", "identity.js")
    }
  };
}

exports.sphere = function (sphere) {
  if (typeof sphere === "string")
    return make(undefined, sphere, undefined);
  if (typeof sphere.path === "string")
    return make(sphere.argument, sphere.path, undefined);
  return make(sphere.argument, sphere.path.sub, sphere.path.cast);
};
