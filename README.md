# Otiluke <img src="img/otiluke.png" align="right" alt="otiluke-logo" title="Resilient Sphere of Otiluke">

Otiluke is a toolbox for JavaScript source-to-source compilers (also called transpiler) which are written as [CommonJS modules](http://www.commonjs.org/).
Otiluke is itself an npm module and should be installed with `npm install otiluke -g`.
With Otiluke you can:

1. Debug and benchmark your JavaScript transpiler: [`--test`](#otiluke---test)
2. Demonstrate how awesome is your JavaScript transpiler: [`--demo`](#otiluke---demo)
3. Deploy your JavaScript transpiler on node modules: [`--node`](#otiluke---node)
4. Deploy your JavaScript transpiler on online HTML pages: [`--mitm`](#otiluke---node)

Otiluke expects the transpiler to be a CommonJS module exporting a function compiling JavaScript to JavaScript.
The transpiler module will always be executed side-by-side with the program targetted for transpilation.
Such online transpilation process enables easy support for dynamic code evaluation -- e.g. [`eval`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval).
Otiluke provides a channel -- `Otiluke.log(string)` by default -- to log information gathered during the transpilation process or later, while executing the transpiled program

<img src="img/demo.png" align="center" alt="demo" title="Otiluke's demo tool"/>

Otiluke's tools often understand the following important arguments:
`--transpile` which points to the transpilation module,
`--main` which points to the entry point of the program to be transpiled,
and `--log` which points to a log file collecting the data sent by `Otiluke.log(string)`.
As demonstreated below, Otiluke's tools can often perform several transpilatations at once if these arguments points to directory instead of files.
Otiluke essentially performs a [cartesian product](https://en.wikipedia.org/wiki/Cartesian_product) of the JavaScript files directly contained inside the `--transpile` and `--main` directory.
If `--log` points to a directory, Otiluke creates a new file inside of it for every transpilation.
Otiluke does its best to give meaningfull name to these files by following an URL format escaped with hexadecimal sequences.

<img src="img/test.png" align="center" alt="test" title="Otiluke's test tool"/>

++Argument++ | Shortcut | ____Tool____      | Description
--------------|----------|-------------------|-----------------------------------------------------------------------------------------------------------------------------------------------
`--transpile` | `-t`     | all but `--mitm`  | Can either point directly to a transpilation module or a directory of transpilation modules.
`--transpile` | `-t`     | `--mitm`          | Path to a transpilation modules.
`--port`      | `-p`     | `--test`          | Port to deploy a HTTP server; if omited, a random unused port is used.
`--port`      | `-p`     | `--mitm`          | Port to deploy a forward HTTP proxy; if omited a random unsused port is used. 
`--main`      | `-m`     | `--demo`          | Can either point directly to a standalone script or a directory of standalone scripts.
`--main`      | `-m`     | `--node`          | Can either point directly to a node entry point file or directory of node entry points.
`--namespace` | `-n`     | all               | Rename the global variable hodling Otiluke's helper functions (only `log` for the moment).
`--log`       | `-l`     | all but `--demo`  | Can either point to a log file or a directory to be populated with log files; if omitted, all logs are redirected to `process.stdout`.
`--out`       | `-o`     | `--demo`          | Path to output the bundled html file.
`--reset`     | `-r`     | `--mitm`          | Reset all certificates created while performing past man-in-the-middle attacks 

## `otiluke --test`

`otiluke --test` deploys a local HTTP server for debugging and benchmarking transpilation modules. 
On receiving HTTP requests, the server [browserifies](http://browserify.org/) the given transpilations modules and bundles the standalone scripts pointed by the request's URL.
So essentially, the `--main` argument is provided later as URL of incoming HTTP requests.

```shell
otiluke --test --transpile path/to/transpile[.js] --port 8080 --namespace Otiluke --log path/to/log[.txt] 
```
```javascript
require("otiluke").test({
  transpile: "path/to/transpile",
  port: 8080,
  namespace: "Otiluke",
  log: "path/to/log"
});
```

## `otiluke --demo`

`otiluke --demo` [browserifies](http://browserify.org/) the given transpilation module(s) and bundles the standalone script(s) into a standalone html page.
This page serves as a demonstration to this awesome transpilation module of yours.
Note that only the dependencies initially present in the given transpilation modules will be bundled into the page, therefore arbitrary requires are not supported in the demo page.

```shell
otiluke --demo --transpile path/to/transpile[.js] --main path/to/main[.js] --namespace Otiluke --out path/to/bundle.html
```
```javascript
require("otiluke").demo({
  transpile: "path/to/transpile",
  main: "path/to/main",
  namespace: "Otiluke",
  out: "path/to/bundle.html"
});
```

## `otiluke --node`

`otiluke --node` deploys transpilation module(s) on node application(s).
Before being executed, every required module is intercepted and passed to the transpiler.
This transpilation process should work just fine in most cases but may not resist (yet) throughout introspection of the node module system.

```shell
otiluke --demo --transpile /path/to/transpile[.js] --main /path/to/main[.js] --namespace Otiluke --log path/to/log[.txt]
```
```javascript
require("otiluke").node({
  transpile: "path/to/transpile",
  main: "path/to/main",
  namespace: "Otiluke",
  log: "path/to/log"
});
```

## `otiluke --mitm`

`otiluke --mitm` deploys a forward HTTP proxy at the given port which effectively implements the man-in-the-middle attack.
The given transpilation module is [browserified](http://browserify.org/) into every requested HTML page while the JavaScript traffic is stringified and passed to the transpiler.
Note that inline event handlers are NOT intercepted (yet).

```shell
otiluke --demo --transpile /path/to/transpile.js --port 8080 --namespace Otiluke --log path/to/log[.txt]
```
```javascript
require("otiluke").node({
  transpile: "path/to/transpile",
  main: "path/to/main",
  namespace: "Otiluke",
  log: "path/to/log"
});
```

`otiluke --mitm` requires [openssl](https://www.openssl.org/) to be accessible via the PATH.
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

