
var HtmlParser = require("htmlparser2")

//var Convert = require("./convert.js")
// // http://www.w3schools.com/tags/ref_eventattributes.asp
// // Such rudimentory predicate might be inaccurate, to be verified
// function isjsattribute (name) { return name.indexOf("on") === 0 }

module.exports = function (namespace, initialize) {
  return function (out) {
    var first = true;
    var script = null;
    var src, async, defer;
    var handlers = [];
    var index = 0;
    Object.getPrototypeOf(this).pipe.call(this, new HtmlParser.Parser({
      onprocessinginstruction: function (name, data) { out.write("<"+data+">") },
      onopentag: function(tag, attributes) {
        if (tag === "script") {
          if (first) {
            first = false;
            out.write("<script>");
            out.write(initialize);
            out.write("</script>");
          }
          script = [];
          src = attributes.src;
          delete attributes.src;
          async = String("async" in attributes);
          defer = String("defer" in attributes);
        }
        out.write("<"+tag)
        if (!("id" in attributes))
          attributes.id = namespace+(++index);
        for (var name in attributes)
          if (name.indexOf("on") === 0)
            handlers.push(namespace+".handler(document.getElementById("+JSON.stringify(attributes.id)+"),"+JSON.stringify(name)+","+JSON.stringify(attributes[name])+");\n");
          else
            out.write(" "+name+"=\""+attributes[name]+"\"");
        out.write(">");
      },
      ontext: function(text) { script ? script.push(text) : out.write(text) },
      onclosetag: function(tag) {
        if (tag === "script") {
          out.write(handlers.join(""));
          handlers = [];
          if (src) {
            out.write(namespace+".otiluke("+JSON.stringify(src)+","+async+","+defer+")");
          } else {
            out.write(namespace+".script(");
            out.write(JSON.stringify(script.join("")));
            out.write(",null)");
          }
        } else if (tag === "body") {
          out.write("<script>");
          out.write(handlers.join(""));
          out.write("</script>");
        }
        out.write("</"+tag+">");
        script = null;
      },
      oncomment: function (data) { out.write("<!--"+data+"-->") },
      onend: function () { out.end() }
    }, {decodeEntities:true}));
  }
}
