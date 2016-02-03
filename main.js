
var Browserify = require("browserify");
var Page = require("./page.js");
var Node = require("./node.js");

// options: {setup:Path, intercept:Function, port:Number, main:Path, out:Path}
module.exports = function (options) {
  if (options.main)
    var main = Node;
  if (options.port)
    var main = Page;
  if (!options.setup)
    return main(new Buffer(), options);
  Browserify({detectGlobals:false, builtins:[]})
    .add(options.setup)
    .bundle(function (err, buf) {
      if (err)
        throw err;
      main(buf, options);
    });
};
