
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
    if (!global.${options["global-variable"]}) {
      const Antena = require("antena/browser");
      const Virus = require(${JSON.stringify(Path.resolve(options["virus"]))});
      let pairs = [];
      global.${options["global-variable"]} = (script, source) => {
        pairs[pairs.length] = [script, source];
      };
      const options = {};
      const url = new URL(location.href);
      for (let key of url.searchParams.keys()) {
        if (key.startsWith(${JSON.stringify(options["url-search-prefix"])})) {
          options[key.substring(${String(options["url-search-prefix"].length)})] = url.searchParams.get(key);
        }
      }
      Virus(new Antena().fork(${JSON.stringify(options["http-splitter"])}), options, (error, infect) => {
        if (error)
          throw error;
        global.${options["global-variable"]} = (script, source) => {
          global.eval(infect(script, source));
        };
        for (let index=0; index<pairs.length; index++)
          global.${options["global-variable"]}(pairs[index][0], pairs[index][1]);
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
  const javascript = (script, url) => options["global-variable"]+"("+JSON.stringify(script)+", "+JSON.stringify(url.origin+url.pathname)+");";
  const html = (page, url) => {
    let counter = 0;
    return page.replace(/(<script[^>]*>)([\s\S]*?)(<\/script>)/gi, (match, part1, part2, part3, offset) => {
      if (/^<script[\s\S]*?src[\s]*?=[\s\S]*?>$/i.test(part1))
        return match;
      return part1+options["global-variable"]+"("+JSON.stringify(part2)+","+JSON.stringify(url.origin+url.pathname+"#"+(++counter))+")"+part3;
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
