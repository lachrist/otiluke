
var Url = require("url");

module.exports = function (splitter) {
  return {
    request: function (req, res) {
      if (Url.parse(req.url).path !== "/"+splitter)
        return false;
      var message = "";
      req.on("data", function (data) { message += data });
      req.on("end", function () {
        process.stdout.write(message, "utf8");
        res.writeHead(200, {"content-type":"text/plain"});
        res.end();
      });
      return true;
    },
  };
};
