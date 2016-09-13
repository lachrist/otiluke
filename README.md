# Otiluke <img src="img/otiluke.png" align="right" alt="otiluke-logo" title="Resilient Sphere of Otiluke">

Otiluke is a toolbox for JavaScript source-to-source compilers - here called transpilers - which are written as [CommonJS modules](http://www.commonjs.org/).
Otiluke is itself a npm module and as such, should be installed through `npm install otiluke -g`.
As demonstrated in [usage](./usage), Otiluke can:

1. Debug and benchmark your JavaScript transpiler(s): [`--test`](#otiluke---test)
2. Demonstrate how awesome are your JavaScript transpiler(s): [`--demo`](#otiluke---demo)
3. Deploy your JavaScript transpiler(s) on node module(s): [`--node`](#otiluke---node)
4. Deploy your JavaScript transpiler on online HTML pages: [`--mitm`](#otiluke---mitm)

The transpiler module will always be executed side-by-side with the program targeted for transpilation.
Such online transpilation process enables easy support of dynamic code evaluations such as [`eval(script)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval).
As illustrated below, Otiluke provides a log channel in the options argument to trace information gathered during the transpilation process or later, while executing the transpiled program.

<img src="img/demo.png" align="center" alt="demo" title="otiluke --demo"/>

Otiluke's tools often understand the following important arguments: `--transpile` which points to the transpiler, `--main` which points to the entry point of the program to be transpiled, and `--log` which points to a log file for collecting the data sent through `Otiluke.log(string)`.
As demonstrated below, Otiluke's tools can often perform several transpilations at once if these arguments point to directories instead of files.
In such case, the resulting transpilations are the results of a [cartesian product](https://en.wikipedia.org/wiki/Cartesian_product) of the JavaScript files directly contained inside the `--transpile` and `--main` directory.
If `--log` points to a directory, Otiluke creates a new log file inside of it for every transpilations.
The names of these log files are URLs containing [hexadecimal escape sequences](https://mathiasbynens.be/notes/javascript-escapes#hexadecimal).

<img src="img/test.png" align="center" alt="test" title="otiluke --test"/>

```shell
> require("fs").readdirSync("./").map(function (name) { return eval("'"+name+"'") })
[ '.gitignore',
  '/fac.js?transpile=identity.js#0',
  '/fac.js?transpile=logsource.js#0',
  '/fibo.js?transpile=identity.js#0',
  '/fibo.js?transpile=logsource.js#0' ]
```

&nbsp;&nbsp;&nbsp;Argument&nbsp;&nbsp;&nbsp; | Shortcut | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Tool&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | Description
--------------|----------|-------------------|-----------------------------------------------------------------------------------------------------------------------------------------------
`--transpile` | `-t`     | all but `--mitm`  | Path to a transpiler or a directory of transpilers.
`--transpile` | `-t`     | `--mitm`          | Path to a transpiler.
`--port`      | `-p`     | `--test`          | Port to deploy a HTTP server; if omitted, a free random port is used.
`--port`      | `-p`     | `--mitm`          | Port to deploy a forward HTTP proxy; if omitted a free random port is used. 
`--main`      | `-m`     | `--demo`          | Path to a standalone script or a directory of standalone scripts.
`--main`      | `-m`     | `--node`          | Path to a node main file or directory of node main files.
`--namespace` | `-n`     | all               | Rename the global variable holding Otiluke's helper functions (only `log` for the moment).
`--log`       | `-l`     | all but `--demo`  | Path to a log file or a directory to be populated with log files; if omitted, all logs are redirected to `process.stdout`.
`--out`       | `-o`     | `--demo`          | Path to output the bundled html page.
`--reset`     | `-r`     | `--mitm`          | Reset all certificates created while performing past man-in-the-middle attacks 

## `otiluke --test`

`otiluke --test` deploys a local http server for debugging and benchmarking transpiler(s). 
On receiving http requests, the server [browserifies](http://browserify.org/) the given transpiler(s) and bundles the standalone script(s) pointed by the request's URL.
So essentially, the `--main` argument is provided later as URL of incoming http requests.

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

`otiluke --demo` [browserifies](http://browserify.org/) the given transpiler(s) and bundles the standalone script(s) into a standalone html page.
This page serves as a demonstration to these awesome transpiler(s) of yours.
Note that only the dependencies initially present in the given transpiler(s) will be bundled into the page, therefore arbitrary requires are not supported in the demo page.

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

`otiluke --node` deploys transpiler(s) on node application(s).
Before being executed, every required module is intercepted and passed to the transpiler.
This transpilation process should work just fine in most cases but may not resist (yet) throughout introspection of the node module system.
For process lovers: `require("child_process").fork` is used with inherited standard streams.

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

`otiluke --mitm` deploys a forward HTTP proxy at the given port which effectively carry out a man-in-the-middle attack.
The given transpilation module is [browserified](http://browserify.org/) into every requested HTML page and receive the entire JavaScript traffic.
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

### Trust Otiluke's root certificate

First, you have to indicate Firefox that you trust Otiluke's root certificate.
Go to `about:preferences#advanced` then click on *Certificates* then *View Certificates*.
You can now import Otiluke's root certificate which can be found at `/path/otiluke/mitm/ca/cacert.pem`.
After changes in certificates' trust, restart Firefox to avoid `sec_error_reused_issuer_and_serial` error.
Note that you can reset all Otiluke's certificates with

```shell
otiluke --mitm --reset
```
```javascript
require("otiluke").mitm({reset:true});
```

<img src="img/firefox-cert.png" align="center" alt="firefox proxy" title="Firefox's proxy settings"/>

### Redirect requests to the MITM proxy

Second, you have to redirect all Firefox requests to the local port where the MITM proxy is deployed.
Go again to `about:preferences#advanced` then click on *Network* then *Settings...*.
You can now tick the checkbox *Manual proxy configuration* and *Use this proxy server for all protocols*.
The HTTP proxy fields should be the localhost `127.0.0.1` and the port given in the options.

<img src="img/firefox-proxy.png" align="center" alt="firefox proxy" title="Firefox's proxy settings"/>
