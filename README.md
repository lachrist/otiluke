# Otiluke <img align="right" src="https://github.com/lachrist/oliluke/blob/master/otiluke.gif">

Otiluke is a npm module that intercepts every bit of JavaScript code within a HTML page.
To install, simply run `npm install otiluke -g`.
To run:

```otiluke [before] [runtime] [otiluke] <[in] >[out]```

* `[in]`: path to an input HTML file.
* `[out]`: path to an ouput HTML file.
* `[before]`: path to an initializing JavaScript file that will be executed before any JavaScript code present on the input HTML file.
* `[runtime]`: JavaScript locator (e.g. `runtime` or `namespace.runtime`) that points to a runtime evaluation function that will be called with every bit of JavaScript code present on the HTML file. You probably want to define such function inside the initializing JavaScript file.
* `[otiluke]`: JavaScript locator (e.g. `otiluke` or `namespace.otiluke`) that points to a safe runtime location where Otiluke can do its magic. If other JavaScript code mess around with this location, bad things will happen (e.g. deferred external script might disapear).

N.B. The following (reasonable) assumptions should hold for the input HTML page:
* there is exactly one `head` tag
* there is exactly one `body` tag
* the `head` tag occurs before the `body` tag
* No javascript before the `head` tag or within its attributes
* No javascript after the `body` tag

DISCLAIMER: This module will intercept any JavaScript code that is statically present on the page ; this does not cover JavaScript code that is dynamically evaluated using evil stuff like:
* `eval`
* `Function`
* `document.createElement('script')`
However the runtime evaluation function can intercept those constructs so that dynamic code can still be controlled.

## Demo

Run the below command within the installation directory
```shell
otiluke runtime otiluke test/before.js <test/test.html >test/out.html
```

Output HTML file:
```html
<html>
  <head><script>console.log("before")
window.runtime = window.eval
//////////////////////
// Begin-of-Otiluke //
//////////////////////

// This code is used to support external script file.
// It is based on XMLHttpRequest technology.

window.otiluke = (function () {

  var ready = false
  var deferred = []
  var done = 0

  function check () { if (ready && done === deferred.length) { deferred.forEach(window.runtime) } }

  return {
    load: function (src, charset, async, defer) {
      var request = new XMLHttpRequest()
      request.open("GET", src, async||defer)
      if (charset) { request.setRequestHeader("Accept-Charset", charset) }
      request.send(null)
      if (async) {
        request.onreadystatechange = function () {
          if (request.readyState === 4) {
            window.runtime(request.responseText)
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
        window.runtime(request.responseText)
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
</script>
    <script>window.runtime("console.log(\"text1\")")</script>
    <script defer="">otiluke.load("script1.js",null,false,true)</script>
    <script>otiluke.load("script2.js",null,false,false)</script>
    <script async="">otiluke.load("script3.js",null,true,false)</script>
    <script defer="">otiluke.load("script4.js",null,false,true)</script>
    <script>window.runtime("console.log(\"text2\")")</script>
  </head>
  <body>
    <button onclick="window.runtime(&#34console.log('&#38&#38&#38')&#34)">Button</button>
  <script>otiluke.after()</script></body>
</html>
```

Console log when loading the page:
```
before
text1
out.html:24 Synchronous XMLHttpRequest on the main thread is deprecated.
script2
text2
script1
script4
script3
```

## API

Otiluke can also be used as a node module instead of a command line tool.
It exposes only one function:

