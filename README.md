# Otiluke <img align="right" src="https://github.com/lachrist/oliluke/blob/master/otiluke.gif">

Otiluke is a npm module that intercepts every bit of JavaScript code within a HTML page.
To install, simply execute `npm install otiluke -g`.
To run:

```otiluke <in >out [before] [runtime] [otiluke] ```

* `in`: path to an input HTML file.
* `out`: path to an ouput HTML file.
* `[before]` default `'/dev/null'`: path to an initializing JavaScript file that will be executed before any JavaScript code present on the input HTML file.
* `[runtime]` default `'runtime'`: JavaScript locator (e.g. `runtime` or `namespace.runtime`) that points to a runtime evaluation function that will be called with every bit of JavaScript code present on the HTML file. You probably want to define such function inside the initializing JavaScript file.
* `[otiluke]` default `'otiluke'`: JavaScript locator (e.g. `otiluke` or `namespace.otiluke`) that points to a safe runtime location where Otiluke can do its magic. If some other JavaScript code mess around with this location, bad things will happen (e.g. deferred external script might disappear).

N.B. The following (reasonable) assumptions should hold for the input HTML page:

* There is exactly one `head` tag.
* There is exactly one `body` tag.
* The `head` tag occurs before the `body` tag.
* No JavaScript before the `head` tag or within its attributes.
* No JavaScript after the `body` tag.

DISCLAIMER: This module will intercept any JavaScript code that is statically present on the page ; this does not cover JavaScript code that is dynamically evaluated using evil stuff like:

* `eval`
* `Function`
* `document.createElement('script')`

However, it is possible to intercept those constructs within the runtime evaluation function and still control dynamic code evaluation.

## Demo

1. Run the below command within the installation directory:
  ```
  otiluke <test/in.html >test/out.html test/before.js runtime otiluke
  ```

2. Take a look at the files in the test directory (especially `out.html`).

3. Providing you have a simple HTTP server running on the test directory; loading `out.html` will trigger the following log in the JavaScript console:

  ```
  before
  text1
  Synchronous XMLHttpRequest on the main thread is deprecated
  script2
  text2
  script1
  script4
  script3
  ```

## API

Otiluke can also be used as a node module instead of a command line tool:

```javascript
var Otiluke = require('otiluke');
function onjs (code, location) {
  // Location is either 'script' or a HTML attribute name //
  // Here we call the runtime evaluation function but it is not mandatory //
  return ['window.', runtimeName, '(', JSON.stringify(code), ')'].join('');
}
Otiluke(inputStream, outputStream, beforePath, runtimeName, otilukeName, onjs)
```

