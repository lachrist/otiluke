
var beat = 2*60*1000;

module.exports = function (ondead) {
  var servers = {};
  function each (name) {
    servers[name].getConnections(function (error, count) {
      console.log(name);
      console.log(arguments);
      if (error)
        return Error(__filename+"-"+name)(error);
      if (!count) {
        servers[name].close();
        delete servers[name];
        ondead(name);
      }
    });
  };
  setInterval(function () { Object.keys(servers).forEach(each) }, beat);
  return function (name, server) {
    setTimeout(function () { servers[name] = server }, beat);
  };
};
