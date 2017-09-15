
var Common = require("./common.js");

module.exports = Common(performance, function (source, callback) {
  var req = new XMLHttpRequest();
  req.open("GET", source);
  req.onerror = callback;
  req.onload = function () {
    callback(req.status !== 200 && new Error("Cannot load "+source+": "+req.status+" "+req.statusText), req.responseText);
  };
  req.send();
});
