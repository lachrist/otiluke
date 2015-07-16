
// TODO use DOM observers (with subtree options)
// to intercept script tag insterted at runtime.

window.@NAMESPACE.otiluke = (function () {

  var deferred = [];

  window.addEventListener("load", function () {
    deferred.forEach(function (def) {
      if (def)
        window.@NAMESPACE.script(def.js, def.src);
    });
    deferred = null;
  });

  return function (src, async, defer) {
    var request = new XMLHttpRequest()
    request.open("GET", src, async||defer);
    if (defer || async) {
      if (defer && deferred) {
        var id = deferred.push(null) - 1;
        request.onreadystatechange = function () {
          if (request.readyState === 4) {
            if (deferred)
              deferred[id] = {js:request.responseText, src:src};
            else
              window.@NAMESPACE.script(request.responseText, src);
          }
        };
      } else {
        request.onreadystatechange = function () {
          if (request.readyState === 4)
            window.@NAMESPACE.script(request.responseText, src);
        };
      }
      return request.send();
    }
    request.send();
    window.@NAMESPACE.script(request.responseText, src);
  }

} ());
