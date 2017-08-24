
var Tunnel = require("./tunnel.js");

function apply (f) {
  return function (xs) {
    return f.apply(null, xs);
  };
}

module.exports = function (beat, onsetup) {
  var servers = {};
  var tunnels = {};
  var pendings = {};
  setInterval(function () {
    for (var name in servers) {
      servers[name].getConnections(function (error, count) {
        if (error)
          throw error;
        if (!count) {
          servers[name].close();
          delete servers[name];
          delete tunnels[name];
        }
      });
    }
  }, beat);
  function setup (host, receptor, server) {
    onsetup(host, server);
    server.listen(0, function () {
      // We let the server open at least one beat
      setTimeout(function () { servers[name] = server }, beat);
      tunnels[host] = Tunnel(server.address().port);
      pendings[host].forEach(apply(tunnels[host]));
      delete pendings[host];
    });
  }
  return {
    link: function (host, socket, head) {
      if (host in tunnels)
        return tunnels[host](socket, head);
      if (host in pendings)
        return pendings[host].push([socket, head]);
      Http.request("http://"+host).on("response", function () {
        setup(host, receptor, Http.createServer());
      }).on("error", function () {
        Ca(host.split(":")[0], function (error, result) {
          if (error)
            return socket.end(String(error), "utf8");
          setup(host, receptor, Https.createServer(result));
        });
      }).end();
    },
    close: function () {
      servers.forEach(function (server) {
        server.close();
      });
    }
  };
};
