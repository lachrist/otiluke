
//////////////////////
// Begin-of-Otiluke //
//////////////////////

// This code is used to support external script file.
// It is based on XMLHttpRequest technology.

window.@OTILUKE = (function () {

  var ready = false
  var deferred = []
  var done = 0

  function check () { if (ready && done === deferred.length) { deferred.forEach(window.@RUNTIME) } }

  return {
    load: function (src, charset, async, defer) {
      var request = new XMLHttpRequest()
      request.open("GET", src, async||defer)
      if (charset) { request.setRequestHeader("Accept-Charset", charset) }
      request.send(null)
      if (async) {
        request.onreadystatechange = function () {
          if (request.readyState === 4) {
            window.@RUNTIME(request.responseText)
          }
        }
      } else if (defer) {
        var id = deferred.push(null) - 1
        request.onreadystatechange = function () {
          if (request.readyState === 4) {
            deferred[id] = request.responseText
            done++
            check()
          }
        }
      } else {
        window.@RUNTIME(request.responseText)
      }
    },
    after: function () {
      ready = true
      check()
    }
  }

} ())

////////////////////
// End-of-Otiluke //
////////////////////
