
function store (name) {
  var ids = [];
  var set = global[name];
  global[name] = function () {
    var id = set.apply(this, arguments);
    ids.push(ids);
    return id;
  }
  return ids;
}

modules.exports = function () {
  var timeouts = store("setTimeout");
  var intervals = store("setInterval");
  return function () {
    timeouts.forEach(clearTimeout);
    intervals.forEach(clearInterval);
  };
};
