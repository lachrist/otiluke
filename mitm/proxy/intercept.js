
const Fs = require("fs");
const Path = require("path");
const Stream = require("stream");
const Browserify = require("browserify");

module.exports = (emitter, options) => {
  var setup = "alert(\"Otiluke >> bundling not yet performed, retry in a sec...\")l";
  const done = (js) => {
    setup = "<script>"+js.replace("</script>", "<\\/script>")+"</script>";
  };
  const readable = new Stream.Readable();
  readable.push(`
    if (!global.${options["transform-variable"]}) {
      const Antena = require("antena/browser");
      const Transform = require(${JSON.stringify(Path.resolve(options.transform))});
      let pairs = [];
      global.${options["transform-variable"]} = (script, source) => {
        pairs[pairs.length] = [script, source];
      };
      Transform(new Antena().fork(${JSON.stringify(options["http-splitter"])}), new URL(location.href).searchParams.get(${JSON.stringify(options["url-search-key"])}), (error, transform) => {
        if (error)
          throw error;
        global.${options["transform-variable"]} = (script, source) => {
          global.eval(transform(script, source));
        };
        for (let index=0; index<pairs.length; index++)
          global.${options["transform-variable"]}(pairs[index][0], pairs[index][1]);
        pairs = null;
      });
    }`);
  readable.push(null);
  Browserify(readable, {basedir:__dirname}).bundle((error, bundle) => {
    if (error) {
      done("alert(\"Otiluke >> bundling error: \"+"+JSON.stringify(error.message)+");");
      error.message += "[bundling error]";
      emitter.emit("error", error);
    } else {
      done(bundle.toString("utf8"));
    }
  });
  const javascript = (script, source) => options["transform-variable"]+"("+JSON.stringify(script)+", "+JSON.stringify(source)+");";
  const html = (page, source) => page.replace(/(<script[^>]*>)([\s\S]*?)(<\/script>)/gi, (match, part1, part2, part3, offset) => {
    if (/^<script[\s\S]*?src[\s]*?=[\s\S]*?>$/i.test(part1))
      return match;
    source.offset = offset;
    return part1+options["transform-variable"]+"("+JSON.stringify(part2)+","+JSON.stringify(source)+")"+part3;
  }).replace(/<head[^>]*>/i, (match) => match+setup);
  return (mime) => {
    if (mime.indexOf("html") !== -1) {
      return html;
    }
    if (mime.indexOf("javascript") !== -1) {
      return javascript;
    }
  };
};
