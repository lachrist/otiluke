var Fs = require("fs");
var Path = require("path");
module.exports = function (callback) {
  Fs.readFile(Path.join(__dirname, "..", "img", "otiluke.png"), "base64", function (error, content) {
    callback(error, "<link rel=\"icon\" href="+JSON.stringify("data:image/png;base64,"+content)+">");
  });
};