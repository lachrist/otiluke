# Otiluke <img src="img/otiluke.png" align="right" alt="otiluke-logo" title="Resilient Sphere of Otiluke">

TODO: sec_error_reused_issuer_and_serial

Otiluke is a npm module that intercepts JavaScript within HTML pages and Node modules.
To install:

```sh
npm install otiluke
```

## Intercept JavaScript within Node modules:

```javascript
var Otiluke = require("otiluke");
function intercept (url) {
  console.log("Intercepting " + url);
  return function (js) {
    return "console.log('Executing ' + " + JSON.stringify(url) + ");\n" + js;
  }
}
Otiluke({
  setup: ".absolute/path/to/setup.js",
  intercept: intercept,
  main: "/absolute/path/to/main.js",
  out: "/absolute/path/to/bundle.js"
});
```

Under the hood, [Browserfiy](http://browserify.org/) explores the require graph starting from the entry point `options.main`.
Whenever a new file is required, the function `options.intercept` is called with the url path to that file.
If this function returns a false value, no transformation is applied to the content of the file.
If the intercept functions returns a true value, it should be function that transform JavaScript code.
The transformed code is bundled and preceded by `options.setup` which may itself points to the entry point of a node module.
The result is output to `options.out` or `stdout` if this option is no provided.

## Intercept JavaScript within HTML pages:

```javascript
var Otiluke = require("otiluke");
Otiluke({
  setup: "/absolute/path/to/setup.js",
  intercept: intercept
  port: 8080
});
```

To intercept JavaScript code within HTML pages, Otiluke deploy an MITM Proxy on local port `options.port`.
This proxy intercepts every requests and transform their responses.
The options `setup` and `intercept` are similar to the ones of the Node mode.
Two modifications should be done on your browser -- here Firefox but should works on other browsers as well -- before deploying the MITM proxy:
 
1. You have to indicate Firefox that you trust Otiluke's root certificate.
   Go to `about:preferences#advanced` then click on *Certificates* then *View Certificates*.
   You can now import Otiluke's root certificate which can be found at `/path/otiluke/mitm/ca/cacert.pem`.
   Note that you can reset all Otiluke's certificates with

   ```sh
   node /path/to/otiluke/mitm/ca/reset.js --hard
   ```

   <img src="img/firefox-cert.png" align="center" alt="demo-screenshot" title="Firefox's certificate"/>

2. You have to redirect all Firefox requests to the local port where the MITM proxy is deployed.
   Go again to `about:preferences#advanced` then click on *Network* then *Settings...*.
   You can now tick the checkbox *Manual proxy configuration* and *Use this proxy server for all protocols*.
   The HTTP proxy fields should be the localhost `127.0.0.1` and the port given in the options.

   <img src="img/firefox-proxy.png" align="center" alt="demo-screenshot" title="Firefox's proxy settings"/>

