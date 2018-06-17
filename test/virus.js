
module.exports = (antena, {arg1, arg2}, callback) => {
  const [status, message, headers, body] = antena.request("GET", "/"+arg1+"/"+arg2, {}, "");
  if (status !== 200)
    return callback(new Error(status+" "+message));
  const websocket = antena.WebSocket("/"+arg1+"/"+arg2);
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
