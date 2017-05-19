// hijack.js //
var Url = require("url");
module.exports = function (splitter) {
  return {
    request: function (req, res) {
      if (Url.parse(req.url).path !== "/"+splitter)
        return false;
      var message = "";
      req.on("data", function (data) { message += data });
      req.on("end", function () {
        console.log(message);
        res.writeHead(200, {
          "Content-Length": 0,
          "Content-Type": "text/plain"
        });
        res.end();
      });
      return true;
    },
    websocket: function (websocket) {
      return false;
    }
  };
};