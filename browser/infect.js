
const Fs = require("fs");
const Path = require("path");
const Stream = require("stream");
const Browserify = require("browserify");

module.exports = (vpath, virus_var, argm_prefix) => {
  let setup = `<script>alert("Otiluke >> bundling not yet performed, retry in a sec...");</script>`;
  const readable = new Stream.Readable();
  readable.push(`
    if (!global.${virus_var}) {
      const Virus = require(${JSON.stringify(Path.resolve(vpath))});
      const argm = {};
      const url = new URL(location.href);
      for (let key of url.searchParams.keys()) {
        if (key.startsWith(${JSON.stringify(argm_prefix)})) {
          const array = url.searchParams.getAll(key);
          argm[key.substring(${argm_prefix.length})] = array.length === 1 ? array[0] : array;
        }
      }
      global.${virus_var} = Virus(argm);
    }`);
  readable.push(null);
  Browserify(readable, {basedir:__dirname}).bundle((error, bundle) => {
    if (error) {
      setup = `<script>alert(${JSON.stringify("Browserify bundling error: "+error.message)});throw </script>`
    } else {
      setup = `<script>${bundle.toString("utf8").replace("</script>", "<\\/script>")}</script>`;
    }
  });
  const javascript = (script, source) => `eval(${virus_var}(${JSON.stringify(script)}, ${JSON.stringify(source)}));`;
  const html = (page, source) => {
    let counter = 0;
    return page.replace(/(<script[^>]*>)([\s\S]*?)(<\/script>)/gi, (match, part1, part2, part3, offset) => {
      if (/^<script[\s\S]*?src[\s]*?=[\s\S]*?>$/i.test(part1))
        return match;
      return `${part1}eval(${virus_var}(${JSON.stringify(part2)}, ${JSON.stringify(source+"#"+(++counter))}));${part3}`;
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
