const OtilukeBrowser = require("../../browser");
const proxy = OtilukeBrowser("../virus.js", {
  handlers: {
    error: (location, hostname, message) => {
      console.error(location+" >> "+hostname+" >> "+message);
    }
  }
});
proxy.listen(process.argv[2], () => {
  console.log("MITM proxy listening on: "+JSON.stringify(proxy.address()));
});
setTimeout(() => {
  proxy.destroyAll();
  proxy.closeAll(() => console.log("success"));
}, 8000);