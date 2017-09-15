
var Receptor = require("antena/receptor/browser");

module.exports = Receptor({
  onrequest: function (method, path, headers, body, callback) {
    console.log(body);
    callback(200, "ok", {}, "");
  }
});
