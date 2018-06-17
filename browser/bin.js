const OtilukeBrowserReset = require("./reset.js");
const Minimist = require("minimist");
const options = Minimist(process.argv[2].slice(2));
OtilukeBrowserReset(options);