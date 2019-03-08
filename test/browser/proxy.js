const Http = require("http");
const OtilukeBrowserProxy = require("../../browser/proxy");

const listeners = OtilukeBrowserProxy("../virus.js", {
  handlers: {
    forgery: (hostname, server) => {
      console.log("Forgery "+hostname);
      server._otiluke_hostname = hostname;
      server._otiluke_description = "forgery";
      server.on("connection", onconnection);
    },
    activity: (description, origin, emitter) => {
      console.log("Activity from "+origin._otiluke_hostname+": "+description);
      emitter._otiluke_hostname = origin._otiluke_hostname;
      emitter._otiluke_description = description;
      emitter.on("error", onerror);
    }
  }
});
function onconnection (socket) {
  socket._otiluke_hostname = this._otiluke_hostname;
  socket._otiluke_description = "forgery-socket";
  socket.on("error", onerror);
}
function onerror (error) {
  console.log(this._otiluke_description+" from "+this._otiluke_hostname+" >> "+error.message);
}
const proxy = Http.createServer();
proxy._otiluke_hostname = "PROXY";
proxy.on("connection", onconnection);
proxy.on("connect", listeners.connect);
proxy.on("upgrade", listeners.upgrade);
proxy.on("request", listeners.request);
proxy.listen(process.argv[2], () => {
  console.log("mitm-proxy listening to port "+proxy.address().port);
});