# Otiluke <img src="img/otiluke.png" align="right" alt="otiluke-logo" title="Resilient Sphere of Otiluke">

Otiluke is a npm module that intercepts JavaScript within HTML pages and Node modules.
To install:

```sh
npm install otiluke
```

In any case, Otiluke expects a path to a CommonJS module exporting a JavaScript transformation function.
For instance:

```javascript
module.exports = function (code, url) { return code }
```

See [./usage](./usage) for examples.

## Transforming Node modules on-the-fly

```javascript
require("../main.js").node({transform:"path/to/transform.js", main:"/path/to/main.js"});
```

Or alternatively, if Otiluke is installed globally:

```bash
otiluke --node --transform path/to/transform.js --main path/to/main.js
```

## Intercept JavaScript within HTML pages:

```javascript
require("../main.js").mitm({transform:"path/to/transform.js", port:8080});
```

Or alternatively, if Otiluke is installed globally:

```bash
otiluke --mitm --transform path/to/transform.js --port 8080
```

To intercept JavaScript code within HTML pages, Otiluke deploy an MITM Proxy on local port `options.port`.
This proxy intercepts every requests and transform their responses.
Note that inline event handler are NOT intercepted (yet).
Two modifications should be done on your browser -- here Firefox but should works on other browsers as well -- before deploying the MITM proxy:

1. You have to indicate Firefox that you trust Otiluke's root certificate.
   Go to `about:preferences#advanced` then click on *Certificates* then *View Certificates*.
   You can now import Otiluke's root certificate which can be found at `/path/otiluke/mitm/ca/cacert.pem`.
   Note that you can reset all Otiluke's certificates with

   ```sh
   node /path/to/otiluke/mitm/ca/reset.js --hard
   ```

   <img src="img/firefox-cert.png" align="center" alt="demo-screenshot" title="Firefox's certificate"/>

   After changes in certificates' trust, restart Firefox to avoid `sec_error_reused_issuer_and_serial` error.

2. You have to redirect all Firefox requests to the local port where the MITM proxy is deployed.
   Go again to `about:preferences#advanced` then click on *Network* then *Settings...*.
   You can now tick the checkbox *Manual proxy configuration* and *Use this proxy server for all protocols*.
   The HTTP proxy fields should be the localhost `127.0.0.1` and the port given in the options.

   <img src="img/firefox-proxy.png" align="center" alt="demo-screenshot" title="Firefox's proxy settings"/>

