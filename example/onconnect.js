module.exports = function (socket) {
  socket.onmessage = function (event) {
    console.log(event.data);
  };
};