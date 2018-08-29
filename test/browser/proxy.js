const Http = require("http");
const OtilukeBrowserListeners = require("../../browser/listeners.js");

const listeners = OtilukeBrowserListeners("../virus.js", {
  handlers: {
    forgery: (hostname, server) => {
      server._otiluke_hostname = hostname;
      server._otiluke_description = "server";
      server.on("error", onerror);
      console.log("Forgery "+hostname);
    },
    activity: (description, origin, emitter) => {
      emitter._otiluke_hostname = origin._otiluke_hostname;
      emitter._otiluke_description = description;
      emitter.on("error", onerror);
    }
  }
});
function onerror (error) {
  console.log(this._otiluke_description+" from "+this._otiluke_hostname+" >> "+error.message);
}
const proxy = Http.createServer();
proxy._otiluke_hostname = "PROXY";
proxy.on("connect", listeners.connect);
proxy.on("upgrade", listeners.upgrade);
proxy.on("request", listeners.request);
proxy.listen(process.argv[2], () => {
  console.log("mitm-proxy listening to port "+proxy.address().port);
});