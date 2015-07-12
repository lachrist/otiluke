
var HtmlParser = require("htmlparser2")

//var Convert = require("./convert.js")
// // http://www.w3schools.com/tags/ref_eventattributes.asp
// // Such rudimentory predicate might be inaccurate, to be verified
// function isjsattribute (name) { return name.indexOf("on") === 0 }

module.exports = function (namespace, initialize) {
  return function (out) {
    var script = false;
    var src, async, defer;
    Object.getPrototypeOf(this).pipe.call(this, new HtmlParser.Parser({
      onopentag: function(tag, attributes) {
        if (tag === "script") {
          script = true;
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
      ontext: function(text) {
        if (!script)
          return out.write(text);
        if (src)
          return out.write(namespace+".otiluke("+JSON.stringify(src)+","+async+","+defer+")");
        out.write(namespace+".eval(");
        out.write(JSON.stringify(text));
        out.write(")");
      },
      onclosetag: function(tag) {
        out.write("</"+tag+">");
        script = false;
      },
      onend: function () { out.end() }
    }, {decodeEntities:true}));
  }
}
