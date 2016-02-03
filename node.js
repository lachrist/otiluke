
var Browserify = require("browserify");
var Fs = require("fs");
var Stream = require("stream");

module.exports = function (setup, options) {
  var out = options.out ? Fs.createWriteStream(options.out) : process.stdout;
  out.write(setup);
  Browserify({detectGlobals:false, builtins:[]}).transform(function (file) {
    var transform = options.intercept("file://"+file);
    if (!transform)
      return new Stream.Transform({transform:transparent});
    var data = "";
    return new Stream.Transform({
      transform: function (chunk, encoding, callback) {
        data += chunk;
        callback();
      },
      flush: function (callback) { callback
        this.push(transform(data));
        callback();
      }
    });
  }, {global:true}).add(options.main).bundle().pipe(out);
}

function transparent (chunk, encoding, callback) {
  this.push(chunk);
  callback();
}
