
var ChildProcess = require("child_process");

// { sync: boolean
// , target: string || [string]
// , sphere:
//   { path: string
//   , options: json
//   }
// , encoding: string
// , input: string || buffer
// }

module.exports = function (sphere, target) {
  if (typeof target === "string")
    target = [target];
  if (typeof sphere === "string")
    sphere = {path:sphere, options:null};
  return [
    __dirname+"/launch.js",
    sphere.path,
    JSON.stringify(sphere.options),
  ].concat(target);
};
