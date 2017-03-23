
function send (data) { return this._inner_.send(data) }

function on (event, listener) {
  return this_inner_.addEventListener(event, event === "message"
    ? function (event) { listener(event.data) }
    : listener);
}

module.exports = function (websocket) {
  return {_inner_:websocket, send:send, on:on};
};
