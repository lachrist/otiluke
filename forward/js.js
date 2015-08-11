
var Iconv = require("iconv-lite");

module.exports = function (namespace, initialize) {
  namespace = namespace || "__hidden__";
  initialize = initialize || [
    "window."+namespace+" = {",
    "  script: function (js, src) { eval(js) },",
    "  handler: function (node, name, js) { node[name] = new Function('event', js) }",
    "};"
  ].join("\n");
  return {
    internal: function (script) {
      if (script === null)
        return initialize;
      return [namespace, ".script(", JSON.stringify(script), ");"].join("");
    },
    external: function (encoding, incoming, outcoming, source) {
      var chunks = [];
      incoming.on("data", function (chunk) { chunks.push(Iconv.decode(chunk ,encoding)) });
      incoming.on("end", function () {
        outcoming.end(Iconv.encode([
          namespace,
          ".script(",
          JSON.stringify(chunks.join("")),
          ", ",
          JSON.stringify(source),
          ");"
        ].join(""), encoding));
      });
    }
  }
};
