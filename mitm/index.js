
var Stream = require("stream");
var Path = require("path");
var Fs = require("fs");
var Browserify = require("browserify");
var Proxy = require("./proxy");
var Reset = require("./proxy/ca/reset.js");

module.exports = function (options, callback) {
  if (options.reset)
    Reset();
  Fs.readFile(__dirname+"/template.js", "utf8", function (error, content) {
    if (error)
      throw error;
    Bundle(Bind.js(content, {
      NAMESPACE: "var NAMESPACE = "+JSON.stringify(options.namespace)+";",
      SPHERE_NAME: "var SPHERE_NAME = "+JSON.stringify(options.sphere)+";",
      SPHERE: "var SPHERE = require("+JSON.stringify(Path.resolve(options.sphere))+");"
    }), __dirname, [], function (error, bundle) {
      if (error)
        return callback(error);
      var hijack = Hijack(options.channel);
      function onjs (js, source) {
        return "eval("+options.namespace+".onscript("+JSON.stringify(js)+","+JSON.stringify(source)+")" 
      }
      function onhtml (html, source) {
        return [
          "<script>",
          Bind.js(bundle, {
            SPLITTER: "var SPLITTER = "+JSON.stringify(hijack.splitter())+";",
            TARGET_NAME: "var TARGET_NAME = "+JSON.stringify(source)+";"
          }),
          "</script>",
          html.replace(/(<script[^>]*>)([\s\S]*?)(<\/script>)/gi, function (match, p1, p2, p3, offset) {
            return (/^<script[\s\S]*?src[\s]*?=[\s\S]*?>$/i.test(p1)) ? match : p1+onjs(p2, source+"#"+offset)+p3;
          })
        ].join("");
      }
      Proxy(options.port, Onrequest(hijack.request, onhtml, onjs), Onsocket(hijack.socket), callback);
    });
  });
};
