
module.exports = (antena, data, callback) => {
  const [status, message, headers, body] = antena.request("GET", data, {}, "");
  if (status !== 200)
    return callback(new Error(status+" "+message));
  const websocket = antena.connect(data);
  websocket.onerror = () => {
    callback(new Error("WebSocket error..."));
  }; 
  websocket.onopen = () => {
    callback(null, (script, source) => {
      websocket.send(JSON.stringify(source));
      return script;
    });
  }
};
