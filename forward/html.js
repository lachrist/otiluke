// // http://www.w3schools.com/tags/ref_eventattributes.asp
// // Such rudimentory predicate might be inaccurate, to be verified
// function isjsattribute (name) { return name.indexOf("on") === 0 }

var HtmlParser = require("htmlparser2");
var Convert = require("./convert.js");
var Iconv = require("iconv-lite");
var Entities = require("./entities.js");
var template = require("fs").readFileSync(__dirname+"/template.js", {encoding:"utf8"});


module.exports = function (log, nsp, ini) {
  nsp = nsp || "__hidden__";
  initialize = [
    "if (!("+JSON.stringify(nsp)+" in window))",
    "(function () {",
    Convert.js2script(((ini||defini)+template).replace(/@NAMESPACE/g, nsp)),
    "} ());"
  ].join("\n");
  return function (enc, inc, out) {
    return inc.pipe(out);
    var first = true;
    var script = null;
    var src, async, defer;
    var handlers = [];
    var index = 0;
    var est = Iconv.encodeStream(enc);
    est.pipe(out);
    inc.pipe(Iconv.decodeStream(enc)).pipe(new HtmlParser.Parser({
      onprocessinginstruction: function (name, data) { est.write("<"+data+">") },
      onopentag: function(tag, attributes) {
        if (tag === "script") {
          if (first) {
            first = false;
            est.write("<script>");
            est.write(initialize);
            est.write("</script>");
          }
          script = [];
          src = attributes.src;
          async = String("async" in attributes);
          defer = String("defer" in attributes);
          delete attributes.src;
          delete attributes.async;
          delete attributes.defer;
        }
        est.write("<"+tag);
        for (var name in attributes)
          if (name.indexOf("on") === 0) {
            if (!id) {
              if ("id" in attributes) {
                var id = attributes.id;
              } else {
                var id = nsp+(++index);
                est.write(" id=\""+id+"\"");
              }
            }
            handlers.push(nsp+".handler(document.getElementById(\""+id+"\"),\""+name+"\","+JSON.stringify(Convert.attribute2script(attributes[name]))+");\n");
          } else {
            est.write(" "+name+"=\""+attributes[name]+"\"");
          }
        est.write(">");
      },
      ontext: function(text) { script ? script.push(text) : est.write(text) },
      onclosetag: function(tag) {
        if (tag === "script") {
          est.write(handlers.join(""));
          handlers = [];
          if (src) {
            est.write(nsp+".otiluke("+JSON.stringify(src)+","+async+","+defer+");\n");
          } else {
            est.write(nsp+".script(");
            est.write(JSON.stringify(script.join("")));
            est.write(",null);\n");
          }
        } else if (tag === "body") {
          est.write("<script>");
          est.write(handlers.join(""));
          est.write("</script>");
        }
        est.write("</"+tag+">");
        script = null;
      },
      oncomment: function (data) { est.write("<!--"+data+"-->") },
      onend: function () { est.end() }
    }, {decodeEntities:false}));
  };
}
