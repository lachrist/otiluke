const Ws = require("ws");
module.exports = (server) => {
  const wss = new Ws.Server({noServer:true});
  server.on("error", (error) => {
    throw error;
  });
  server.on("request", (request, response) => {
    console.log("Request: "+request.method+" "+request.url+" HTTP/"+request.httpVersion);
    response.end();
  });
  server.on("upgrade", (request, socket, head) => {
    console.log("Upgrade: "+request.method+" "+request.url+" HTTP/"+request.httpVersion);
    wss.handleUpgrade(request, socket, head, (websocket) => {
      websocket.on("message", (message) => console.log(message));
    });
  });
};