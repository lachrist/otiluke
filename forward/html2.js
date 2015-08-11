// // http://www.w3schools.com/tags/ref_eventattributes.asp
// // Such rudimentory predicate might be inaccurate, to be verified
// function isjsattribute (name) { return name.indexOf("on") === 0 }

var Iconv = require("iconv-lite");var script = /(<script[\s\S]*?>)([\s\S]*?)(<\/script>)/gi;

module.exports = function (logger, internal) {
  return function (encoding, incoming, outcoming) {
    var chunks = []
    var first = true;
    function transform (_, open, script, close) {
      var prefix = first ? ("<script>"+internal(null)+"</script>") : "";
      first = false;
      script = (open.indexOf("src") === -1) ? internal(script) : script;
      return prefix+open+script+close;
    }
    incoming.on("data", function (chunk) { chunks.push(Iconv.decode(chunk, encoding)) });
    incoming.on("end", function () { outcoming.end(Iconv.encode(chunks.join("").replace(script, transform), encoding)) });
  };
}
