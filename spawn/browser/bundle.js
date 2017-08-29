
module.exports = function (vpath, callback) {
  Fs.readFile(Path.join(__dirname, "template.js"), "utf8", function (error, content) {
    if (error)
      return callback(error);
    var readable = new Readable();
    readable.push("var VIRUS = require("+JSON.stringify(vpath)+");\n");
    readable.push(content);
    readable.push(null);
    Browserify(readable, {basedir:__dirname}).bundle(callback);
  });
};
