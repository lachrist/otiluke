// TEMPLATE: CONSTANTS VIRUS
if (!global[CONSTANTS.namespace]) {
  var EmitterBrowser = require("antena/emitter/browser");
  var sources = [];
  var scripts = [];
  var length = 0;
  global[CONSTANTS.namespace] = function (source, script) {
    scripts[length] = script;
    sources[length] = source;
    length++;
  };
  function lookup (key) {
    var pairs = global.location.search.substring(1).split("&");
    for (var i=0; i<pairs.length; i++) {
      var pair = pairs[i].split("=");
      if (decodeURIComponent(pair[0]) === key) {
        return decodeURIComponent(pair[1]);
      }
    }
    return null;
  }
  VIRUS(lookup(CONSTANTS.key), EmitterBrowser(location.host, location.protocol === "https:").split(CONSTANTS.splitter), function (error, virus) {
    global[CONSTANTS.namespace] = function (source, script) {
      global.eval(virus(script, source));
    };
    for (var i=0; i<length; i++)
      global[CONSTANTS.namespace](scripts[i], sources[i]);
    sources = null;
    scripts = null;
  });
}