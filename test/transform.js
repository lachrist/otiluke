
module.exports = (antena, parameter, callback) => {
  const [status, message, headers, body] = antena.request("GET", "/"+parameter, {}, "");
  if (status !== 200)
    return callback(new Error(status+" "+message));
  const websocket = antena.WebSocket("/"+parameter);
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
