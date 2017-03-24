
function parse (headers) {
  var object = {};
  headers.split("\r\n").forEach(function (pair) {
    var parts = /([^:]+): ([\s\S]+)/;
    if (!parts)
      throw new Error("Cannot parse: "+pair+ " from "+headers);
    object[parts[1]] = parts[2];
  });
  return object;
}

module.exports = function (url) {
  return function (method, path, headers, body, callback) {
    var req = new XMLHttpRequest();
    req.open(method, url+path, Boolean(callback));
    for (var name in headers)
      req.setRequestHeader(name, headers[name]);
    req.send(body);
    if (!callback)
      return [req.status, parse(req.getAllResponseHeaders()), req.responseText];
    req.onload = function () {
      if (req.readyState === 4)
        callback(req.status, parse(req.getAllResponseHeaders()), req.responseText);
    };
  };
};
