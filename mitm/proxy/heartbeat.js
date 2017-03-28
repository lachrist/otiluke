
var Signal = require("../../util/Signal.js");

var beat = 2*60*1000;

module.exports = function () {
  var servers = {};
  var tunnels = {};
  setInterval(function () {
    for (var name in servers) {
      servers[name].getConnections(function (error, count) {
        if (error)
          return Signal(__filename+"-"+name)(error);
        if (!count) {
          servers[name].close();
          delete servers[name];
          delete tunnels[name];
        }
      });
    }
  }, beat);
  return {
    set: function (name, server) {
      setTimeout(function () { servers[name] = server }, beat);
      tunnels[name] = Tunnel(server.address().port);
    },
    get: function (name) { return tunnels[name] } 
  };
};
