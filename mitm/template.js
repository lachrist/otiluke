
// 'namespace' should be defined //

(function (namespace) {

  if (namespace in this)
    return;

  var dummy = [];
  dummy.send = function (message) { dummy[dummy.length] = message };

  var socket = new WebSocket("wss://"+location.host+"/"+@SPLITTER+"?"+encodeURIComponent(location.href));
  socket.onopen = function () {
    for (var i=0, l=dummy.length; i<l; i++)
      socket.send(dummy[i]);
    dummy = socket;
  }

  Object.defineProperty(this, namespace, {
    value: {
      transpile: require(@TRANSPILE),
      log: function (message) { dummy.send(message) }
    }
  });

} (@NAMESPACE));
