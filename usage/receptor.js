
var Receptor = require("antena/receptor");
var ReceptorMerge = require("antena/receptor/merge"); 

module.exports = ReceptorMerge({
  "begin": Receptor({
    onconnect: function (path, con) {
      con.on("message", function (message) {
        console.log("BEGIN "+message);
      });
    }
  }),
  "end": Receptor({
    onrequest: function (method, path, headers, body, callback) {
      console.log("END "+body);
      callback(200, "ok", {}, "");
    }
  }),
});
