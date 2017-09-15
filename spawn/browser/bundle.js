
module.exports = function (vpath, callback) {
  Fs.readFile(Path.join(__dirname, "client.js"), "utf8", function (error, content) {
    if (error)
      return callback(error);
    var readable = new Readable();
    readable.push("var OTILUKE_VIRUS = require("+JSON.stringify(Path.resolve(vpath))+");\n");
    readable.push(content);
    readable.push(null);
    Browserify(readable, {basedir:__dirname}).bundle(callback);
  });
};
