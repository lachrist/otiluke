
var Http = require("http");

module.exports = function () {
  return Http.createServer(function (req, res) {
    var message = "";
    req.on("data", function (data) { message += data });
    req.on("end", function () {
      process.stdout.write(message);
      res.end();
    });
  });
};
