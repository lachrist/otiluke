
const Fs = require("fs");
const Path = require("path");
const Stream = require("stream");
const Browserify = require("browserify");
const Htmlparser2 = require("htmlparser2");

const encode = (string) => string.replace(/[&<>"]/g, onmatch1);

const escape = (string) => string.replace(/<\/script>/g, onmatch2);

const onmatch1 = (character) => {
  switch (character) {
    case "&": return "&amp;"
    case "<": return "&lt";
    case ">": return "&gt";
    case "\"": return "&quot;" 
  }
  throw new Error("Illegal match: "+character);
}

const onmatch2 = (string) => "<\\"+string.substring(2);

const ishandler = (string) => string.startsWith("on");

module.exports = (vpath, gvar, prefix) => {
  let setup = `<script>alert("Otiluke >> bundling not yet performed, retry in a sec...");</script>`;
  const readable = new Stream.Readable();
  readable.push(
`if (!global.${gvar}) {
  const Virus = require(${JSON.stringify(Path.resolve(vpath))});
  const argm = {};
  const geval = eval;
  const url = new URL(location.href);
  for (let key of url.searchParams.keys()) {
    if (key.startsWith(${JSON.stringify(prefix)})) {
      const array = url.searchParams.getAll(key);
      argm[key.substring(${prefix.length})] = array.length === 1 ? array[0] : array;
    }
  }
  const transform = Virus(argm);
  global.${gvar} = (script, source, handler) => {
    geval(transform(script, source, handler));
  };
}`
  );
  readable.push(null);
  Browserify(readable, {basedir:__dirname}).bundle((error, bundle) => {
    if (error) {
      setup = 
`<script>
alert(${JSON.stringify("Browserify bundling error: "+error.message)});
const error = new Error(${JSON.stringify(error.message)});
error.stack = ${JSON.stringify(error.stack)};
throw error;
</script>`
    } else {
      setup = `<script>${escape(bundle.toString("utf8"))}</script>`;
    }
  });
  let counter;
  let script;
  const prelude = [];
  const output = [];
  const parser = new Htmlparser2.Parser({
    onopentag: (name, attributes) => {
      if (name === "head") {
        output.push(setup);
      }
      output.push("<", encode(name));
      if (!("id" in attributes) && (Object.keys(attributes).some(ishandler) || name === "script"))
        attributes.id = "__otiluke"+(++counter)+"__";
      for (let key in attributes) {
        if (ishandler(key)) {
          prelude.push(
            gvar,
            "(",
            JSON.stringify("document.getElementById("+JSON.stringify(attributes.id)+")["+JSON.stringify(key)+"] = function (event) {"+attributes[key]+"};"),
            ", ",
            JSON.stringify(attributes.id+" "+key),
            ");");
        } else {
          output.push(" ", encode(key), "=\"", encode(attributes[key]), "\"");
        }
      }
      output.push(">");
      script = name === "script" ? "" : null;
    },
    ontext: (text) => {
      if (typeof script === "string") {
        script += text;
      } else {
        output.push(encode(text));
      }
    },
    onclosetag: (name) => {
      if (typeof script === "string") {
        output.push(escape(prelude.join("")+gvar+"("+JSON.stringify(script)+", document.currentScript.id);"));
        prelude.length = 0;
        script = null;
      }
      if (name === "body" && prelude.length) {
        output.push("<script>", escape(prelude.join("")), "</script>");
        prelude.length = 0;
      }
      output.push("</", encode(name), ">");
    },
    onprocessinginstruction: (name, data) => {
      output.push("<", encode(data), ">");
    }
  }, {
    decodeEntities: true
  });
  const javascript = (script, source) => `${gvar}(${JSON.stringify(script)}, ${JSON.stringify(source)});`;
  const html = (page, source) => {
    output.length = 0;
    prelude.length = 0;
    counter = 0;
    parser.parseComplete(page);
    return output.join("");
  };
  return (mime) => {
    if (mime && mime.includes("html"))
      return html;
    if (mime && mime.includes("javascript"))
      return javascript;
    return null;
  };
};
