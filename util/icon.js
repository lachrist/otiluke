var Fs = require("fs");
module.exports = JSON.stringify("data:image/png;base64," + Fs.readFileSync(__dirname+"/../img/otiluke.png").toString("base64"));