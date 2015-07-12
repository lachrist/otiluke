
// TODO use DOM observers (with subtree options)
// to intercept script tag insterted at runtime.

window.@NAMESPACE.otiluke = (function () {

  var ready = false;
  var deferred = [];

  function check () {
    if (ready && deferred.indexOf(null) === -1)
      deferred.forEach(window.@NAMESPACE.eval);
  }

  window.addEventListener("load", function () {
    ready = true;
    check();
  });

  return function (src, async, defer) {
    var request = new XMLHttpRequest()
    request.open("GET", src, async||defer);
    request.setRequestHeader("Content-Type", "text/javascript");
    request.send();
    if (async)
      request.onreadystatechange = function () {
        if (request.readyState === 4)
          window.@NAMESPACE.eval(request.responseText);
      };
    else if (defer) {
      var id = deferred.push(null) - 1;
      request.onreadystatechange = function () {
        if (request.readyState === 4) {
          deferred[id] = request.responseText;
          check();
        }
      };
    } else
      window.@NAMESPACE.eval(request.responseText);
  }

} ());
