
const Fs = require("fs");
const Path = require("path");
const Stream = require("stream");
const Browserify = require("browserify");

module.exports = (vpath, gvar, prefix) => {
  let setup = `<script>alert("Otiluke >> bundling not yet performed, retry in a sec...");</script>`;
  const readable = new Stream.Readable();
  readable.push(`
    if (!global.${gvar}) {
      const Virus = require(${JSON.stringify(Path.resolve(vpath))});
      const argm = {};
      const url = new URL(location.href);
      for (let key of url.searchParams.keys()) {
        if (key.startsWith(${JSON.stringify(prefix)})) {
          const array = url.searchParams.getAll(key);
          argm[key.substring(${prefix.length})] = array.length === 1 ? array[0] : array;
        }
      }
      global.${gvar} = Virus(argm);
    }`);
  readable.push(null);
  Browserify(readable, {basedir:__dirname}).bundle((error, bundle) => {
    if (error) {
      setup = `<script>alert(${JSON.stringify("Browserify bundling error: "+error.message)});throw </script>`
    } else {
      setup = `<script>${bundle.toString("utf8").replace("</script>", "<\\/script>")}</script>`;
    }
  });
  const javascript = (script, source) => `eval(${gvar}(${JSON.stringify(script)}, ${JSON.stringify(source)}));`;
  const html = (page, source) => {
    let counter = 0;
    return page.replace(/(<script[^>]*>)([\s\S]*?)(<\/script>)/gi, (match, part1, part2, part3, offset) => {
      if (/^<script[\s\S]*?src[\s]*?=[\s\S]*?>$/i.test(part1))
        return match;
      return `${part1}eval(${gvar}(${JSON.stringify(part2)}, ${JSON.stringify(source+"#"+(++counter))}));${part3}`;
    }).replace(/<head[^>]*>/i, (match) => match+setup);
  };    
  return (mime) => {
    if (mime && mime.includes("html"))
      return html;
    if (mime && mime.includes("javascript"))
      return javascript;
    return null;
  };
};
