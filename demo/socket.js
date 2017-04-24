module.exports = function () {
  var socket = {
    send: function (message) {
      document.getElementById("socket-textarea").value += ">> "+JSON.stringify(message);
    }
  };
  document.getElementById("socket-button").onclick = function () {
    var message = document.getElementById("socket-input").value;
    document.getElementById("socket-input").value = "";
    document.getElementById("socket-textarea").value += "<< "+JSON.stringify(message);
    if (socket.onmessage)
      socket.onmessage(message);
  };
  return socket;
}
