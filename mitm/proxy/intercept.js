
const Fs = require("fs");
const Path = require("path");
const Stream = require("stream");
const Browserify = require("browserify");
const OnError = require("./on-error.js");

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
      global.${options.name} = (script, source) => {
        pairs[pairs.length] = [script, source];
      };
      Transform(new Antena().fork(${JSON.stringify(options.splitter)}), new URL(location.href).searchParams.get(${JSON.stringify(options.key)}), (error, transform) => {
        if (error)
          throw error;
        global.${options.name} = (script, source) => {
          global.eval(transform(script, source));
        };
        for (let index=0; index<pairs.length; index++)
          global.${options.name}(pairs[index][0], pairs[index][1]);
        pairs = null;
      });
    }`);
  readable.push(null);
  Browserify(readable, {basedir:__dirname}).bundle((error, bundle) => {
    if (error) {
      done("alert(\"Otiluke >> bundling error: \"+"+JSON.stringify(error.message)+");");
      OnError("browserify", emitter)(error);
    } else {
      done(bundle.toString("utf8"));
    }
  });
  const javascript = (script, source) => options.name+"("+JSON.stringify(script)+", "+JSON.stringify(source)+");";
  const html = (page, source) => {
    const url = new URL(source);
    return page.replace(/(<script[^>]*>)([\s\S]*?)(<\/script>)/gi, (match, part1, part2, part3, offset) => {
      if (/^<script[\s\S]*?src[\s]*?=[\s\S]*?>$/i.test(part1))
        return match;
      return part1+options.name+"("+JSON.stringify(part2)+","+JSON.stringify(url.origin+url.pathname+url.search+"#"+offset)+")"+part3;
    }).replace(/<head[^>]*>/i, (match) => match+setup);
  };
  return (mime) => {
    if (mime.indexOf("html") !== -1) {
      return html;
    }
    if (mime.indexOf("javascript") !== -1) {
      return javascript;
    }
  };
};
