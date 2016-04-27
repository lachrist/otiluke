# Otiluke <img src="img/otiluke.png" align="right" alt="otiluke-logo" title="Resilient Sphere of Otiluke">

Otiluke is a toolbox for JavaScript source-to-source compilers (also called transpiler) which are written as [CommonJS modules](http://www.commonjs.org/).
Otiluke is itself an npm module and can be installed with `npm install otiluke -g`.
With Otiluke you can:
1. Debug and benchmark your JavaScript transpiler [--test](./usage/test.js)
2. Demonstrate how awesome your JavaScript transpilers are [--demo](./usage/demo.js)
3. Deploy your JavaScript transpiler on node modules [--node](./usage/node.js)
4. Deploy your JavaScript transpiler on online HTML pages [--mitm](./usage/mitm.js)

Otiluke expects the JavaScript transpiler to be a CommonJS module exporting a transformation function.
This transformation module will always be executed side-to-side with the program targetted for transformation.
Such online transformation process enables easy support for dynamic code evaluation.
Below is the Otiluke's demo tool; see [usage](./usage) for more examples.

<img src="img/demo.png" align="center" alt="demonstration" title="Otiluke's demo tool"/>

## Test a transformation module within a browser: `--test`

The `--test` tool deploys a local HTTP server at the given port, it is usefull to debug and benchmark a transformation module. 
On receiving an HTTP request, the server [browserify](http://browserify.org/) the given transformation module and bundle the target(s) pointed by the request's URL.
The request's URL can point to a single target JavaScript file or a directory exclusively containing target JavaScript files.

```shell
otiluke --test --transform /path/to/transform.js --port 8080
```
```javascript
require("otiluke").test({transform:"/path/to/transform.js", port:8080});
```

## Demonstrate transformation modules within a browser : `--demo`

The `--demo` tool [browserifies](http://browserify.org/) the given transformation module(s) inside a standlone html page and writes it into the given output file.
The transform option can point to a single transformation module or a directory exclusively containing transformation modules.
Use this tool to demonstrate how awesome are your transformation modules.
Note that only the dependencies initially present in the given transformation modules will be bundled into the page, therefore arbitrary requires are not supported in the demo page.

```shell
otiluke --demo --transform /path/to/transform.js --out ./bundle.html
```
```javascript
require("otiluke").demo({transform:"/path/to/transform.js", port:8080});
```

## Transform and execute a node module: `--node`

The `--node` tool first executes the given transformation module.
The main file and its dependencies are then transformed before being executed.

```shell
otiluke --node --transform /path/to/transform.js --main /path/to/main.js
```
```javascript
require("otiluke").node({transform:"/path/to/transform.js", main:"/path/to/main.js"});
```

## Transform every scripts your browser is loading: `--mitm`

The `--mitm` tool deploys a HTTP proxy at the given port which effectively implements the man-in-the-middle attack.
The given transformation module is [browserified](http://browserify.org/) into every requested HTML page while the JavaScript traffic is stringified and passed to the transformation function.
Note that inline event handlers are NOT intercepted (yet).

```shell
otiluke --mitm --transform /path/to/transform.js --port 8080
```
```javascript
require("otiluke").mitm({transform:"/path/to/transform.js", port:"/path/to/main.js"});
```

The `--mitm` tools requires [openssl](https://www.openssl.org/) to be accessible via the PATH.
Also, two modifications should be done on your browser (here Firefox but should works on other browsers as well) before deploying the MITM proxy:

1. You have to indicate Firefox that you trust Otiluke's root certificate.
   Go to `about:preferences#advanced` then click on *Certificates* then *View Certificates*.
   You can now import Otiluke's root certificate which can be found at `/path/otiluke/mitm/ca/cacert.pem`.
   Note that you can reset all Otiluke's certificates with

    ```shell
    otiluke --mitm --reset
    ```
    ```javascript
    require("otiluke").mitm({reset:true});
    ```

   <img src="img/firefox-cert.png" align="center" alt="firefox certificate" title="Firefox's certificate"/>

   After changes in certificates' trust, restart Firefox to avoid `sec_error_reused_issuer_and_serial` error.

2. You have to redirect all Firefox requests to the local port where the MITM proxy is deployed.
   Go again to `about:preferences#advanced` then click on *Network* then *Settings...*.
   You can now tick the checkbox *Manual proxy configuration* and *Use this proxy server for all protocols*.
   The HTTP proxy fields should be the localhost `127.0.0.1` and the port given in the options.

   <img src="img/firefox-proxy.png" align="center" alt="firefox proxy" title="Firefox's proxy settings"/>

