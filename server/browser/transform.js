
const Fs = require("fs");
const Path = require("path");
const Stream = require("stream");
const Browserify = require("browserify");

module.exports = function (path, constants) {
  var setup = "alert(\"Otiluke >> bundling not yet performed, retry in a sec...\")l";
  function done (js) {
    setup = js.replace("</script>", "<\\/script>");
  }
  Fs.readFile(Path.join(__dirname, "template.js"), "utf8", function (error, content) {
    if (error)
      return done("alert(\"Otiluke >> bundling error: \"+"+JSON.stringify(error.message)+");");
    var readable = new Stream.Readable();
    readable.push("var CONSTANTS ="+JSON.stringify(constants));
    readable.push("var VIRUS = require("+JSON.stringify(path)+");\n");
    readable.push(content);
    readable.push(null);
    Browserify(readable, {basedir:__dirname}).bundle(function (error, bundle) {
      if (error)
        return done("alert(\"Otiluke >> bundling error: \"+"+JSON.stringify(error.message)+");");
      done(bundle.toString("utf8"));
    });
  });
  function compile (script) {
    return constants.namespace+"("+JSON.stringify(source)+","+JSON.stringify(script)+");";
  }
  return {
    script: compile,
    page: function (page) {
      return setup+page.replace(/(<script[^>]*>)([\s\S]*?)(<\/script>)/gi, function (match, p1, p2, p3, offset) {
        return /^<script[\s\S]*?src[\s]*?=[\s\S]*?>$/i.test(p1) ? match : p1+compile(p2)+p3;
      });
    }
  };
};
