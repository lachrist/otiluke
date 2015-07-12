
var HtmlParser = require("htmlparser2")

//var Convert = require("./convert.js")
// // http://www.w3schools.com/tags/ref_eventattributes.asp
// // Such rudimentory predicate might be inaccurate, to be verified
// function isjsattribute (name) { return name.indexOf("on") === 0 }

module.exports = function (namespace, initialize) {
  return function (out) {
    var script = null;
    var src, async, defer;
    Object.getPrototypeOf(this).pipe.call(this, new HtmlParser.Parser({
      onprocessinginstruction: function (name, data) { out.write("<"+data+">") },
      onopentag: function(tag, attributes) {
        if (tag === "script") {
          script = [];
          src = attributes.src;
          async = String("async" in attributes);
          defer = String("defer" in attributes);
          delete attributes.src;
          delete attributes.async;
          delete attributes.defer;
        }
        out.write("<"+tag)
        for (var name in attributes)
          out.write(" "+name+"=\""+attributes[name]+"\"")
        out.write(">")
        if (tag === "head") {
          out.write("<script>");
          out.write(initialize);
          out.write("</script>");
        }
      },
      ontext: function(text) { script ? script.push(text) : out.write(text) },
      onclosetag: function(tag) {
        if (script) {
          if (src)
            out.write(namespace+".otiluke("+JSON.stringify(src)+","+async+","+defer+")");
          else {
            out.write(namespace+".eval(");
            out.write(JSON.stringify(script.join("")));
            out.write(")");
          }
        }
        out.write("</"+tag+">");
        script = null;
      },
      oncomment: function (data) { out.write("<!--"+data+"-->") },
      onend: function () { out.end() }
    }, {decodeEntities:true}));
  }
}
