
module.exports = function (options, callback) {
  Fs.readFile(Path.join(__dirname, "template.js"), "utf8", function (error, content) {
    if (error)
      return callback(error);
    var readable = new Stream.Readable();
    readable.push("var TEMPLATE = "+JSON.stringify(options, null, 2)+";\n");
    readable.push(content);
    Browserify(readable, {basedir:__dirname}).bundle(callback);
  });
};
