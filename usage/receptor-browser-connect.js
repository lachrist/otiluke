
var Receptor = require("antena/receptor/browser");

module.exports = Receptor({
  onconnect: function (path, con) {
    con.on("message", console.log.bind(console));
  }
});
