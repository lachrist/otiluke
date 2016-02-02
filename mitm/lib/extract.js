var Url = require("url");

module.exports = function (req) {
  var parts = Url.parse(req.url);
  parts.method = req.method;
  parts.headers = req.headers;
  return parts;
}
