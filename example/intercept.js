var Url = require("url");
module.exports = function (argument) {
  return {
    request: function (req, res) {},
    connect: function (ws) {
      if (Url.parse(ws.upgradeReq.url).path === "/"+argument) {
        ws.onmessage = function (event) { console.log(event.data) };
        return true;
      }
    }
  };
};