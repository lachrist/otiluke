
if (!global[TEMPLATE.namespace]) {
  var ChannelBrowser = require("channel-uniform/browser");
  var scripts = [];
  var sources = [];
  var length = 0;
  global[TEMPLATE.namespace] = function (script, source) {
    scripts[length] = script;
    sources[length] = source;
    length++;
  };
  var channel = ChannelBrowser(location.host, location.protocol === 'https:');
  TEMPLATE.sphere.module(TEMPLATE.sphere.argument, channel, function (sphere) {
    global[TEMPLATE.namespace] = function (script, source) {
      global.eval(sphere(script, source));
    };
    for (var i=0; i<length; i++)
      global.eval(sphere(scripts[i], sources[i]));
    scripts = null;
    sources = null;
  });
}
