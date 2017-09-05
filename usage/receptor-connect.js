
var Receptor = require("antena/receptor");

module.exports = Receptor({
  onconnect: function (path, con) {
    con.on("message", console.log.bind(console));
  }
});
