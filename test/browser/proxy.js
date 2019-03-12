const Http = require("http");
const Listeners = require("../../browser/listeners");

const hostnames = new WeakMap();

const listeners = Listeners("../virus.js", {
  handlers: {
    forgery: (hostname, server) => {
      console.log("Forgery "+hostname);
      hostnames.set(server, hostname);
      server.on("error", (error) => {
        console.error("forgery-server >> "+hostname+" >> "+error.message);
      });
      server.on("connection", (socket) => {
        socket.on("error", (error) => {
          console.error("forgery-socket >> "+hostname+" >> "+error.message);
        });
      });
    },
    activity: (location, server, socket) => {
      console.log("Activity from "+hostnames.get(server)+": "+location);
      socket.on("error", (error) => {
        console.error(location+" >> "+hostnames.get(server)+" >> "+error.message);
      });
    }
  }
});
const proxy = Http.createServer();
proxy.on("error", (error) => {
  console.error("proxy-server >> "+error.message);
});
proxy.on("connection", (socket) => {
  socket.on("error", (error) => {
    console.error("proxy-socket >> "+error.message);
  });
});
proxy.on("connect", listeners.connect);
proxy.on("upgrade", listeners.upgrade);
proxy.on("request", listeners.request);
proxy.listen(process.argv[2], () => {
  console.log("mitm-proxy listening to port "+proxy.address().port);
});