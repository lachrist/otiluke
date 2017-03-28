
/* TEMPLATE SPHERE_NAME */
/* TEMPLATE TARGET_NAME */
/* TEMPLATE SPHERE */
/* TEMPLATE SPLITTER */
/* TEMPLATE NAMESPACE */

var Request = require("../util/request.js");

if (!global[NAMESPACE]) {
  var socket = [];
  socket.send = function (data) { socket.push(data) };
  (new WebSocket("ws"+location.protocol.substring(4)+"//"+location.host+"/"+SPLITTER+"?target="+encodeURIComponent(TARGET_NAME)+"&sphere="+encodeURIComponent(SPHERE_NAME))).onopen = function () {
    for (var i=0, l=dummy.length; i<l; i++)
      this.send(socket[i]);
    socket = this;
    socket.onmessage = this[NAMESPACE].onmessage;
  }
  Object.defineProperty(global, NAMESPACE, {
    value: Sphere({
      sphere: SPHERE_NAME,
      target: TARGET_NAME,
      request: Request(location.protocol+"//"+location.host+"/"+SPLITTER),
      send: function (data) { socket.send(data) },
    })
  });
}
