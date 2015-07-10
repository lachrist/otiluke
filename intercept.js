
var HtmlParser = require("htmlparser2")

//var Convert = require("./convert.js")
// // http://www.w3schools.com/tags/ref_eventattributes.asp
// // Such rudimentory predicate might be inaccurate, to be verified
// function isjsattribute (name) { return name.indexOf("on") === 0 }

module.exports = function (readable, writable, initializer, namespace) {

  var script = false
  var src, async, defer

  readable.pipe(new HtmlParser.Parser({
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
      writable.write("<"+tag)
      for (var name in attributes)
        writable.write(" "+name+"=\""+attributes[name]+"\"")
      writable.write(">")
      if (tag === "head") {
        writable.write("<script>");
        writable.write(initializer);
        writable.write("</script>");
      }
    },
    ontext: function(text) {
      if (!script)
        return writable.write(text);
      if (src)
        return writable.write(namespace+".otiluke("+JSON.stringify(src)+","+async+","+defer+")");
      writable.write(namespace+".eval(");
      writable.write(JSON.stringify(text));
      writable.write(")");
    },
    onclosetag: function(tag) {
      writable.write("</"+tag+">");
      script = false;
    },
    onend: function () { writable.end() }
  }, {decodeEntities:true}));
}
