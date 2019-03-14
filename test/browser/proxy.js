const OtilukeBrowser = require("../../browser");
const proxy = OtilukeBrowser("../virus.js");
proxy.listen(process.argv[2], () => {
  console.log("MITM proxy listening on: "+JSON.stringify(proxy.address()));
});
setTimeout(() => {
  proxy.closeAll();
  proxy.destroyAll();
}, 8000);