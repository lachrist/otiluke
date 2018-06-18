const OtilukeBrowserProxy = require("../../browser/proxy");
const Subscribe = require("../subscribe.js");
const proxy = OtilukeBrowserProxy("../virus.js");
proxy.on("error", (error, location, target) => {
  console.log(error.message+" @"+location);
  console.log(error.stack);
});
Subscribe(proxy);
proxy.listen(process.argv[2], () => {
  console.log("mitm-proxy listening to port "+proxy.address().port);
});