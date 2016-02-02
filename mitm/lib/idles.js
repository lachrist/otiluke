
var dummy = {};

module.exports = function (timeout) {
  var object = {};
  function check (key) {
    if (object[key].__idle__ && typeof object[key].close === "function") {
      object[key].close();
      delete object[key];
    } else {
      object[key].__idle__ = true;
    }
  };
  setInterval(function () { Object.keys(object).forEach(check) }, timeout);
  return {
    get: function (key) {
      (object[key]||dummy).__idle__ = false;
      return object[key];
    },
    set: function (key, value) { return object[key] = value }
  };
}
