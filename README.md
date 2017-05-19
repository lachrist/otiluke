# Otiluke <img src="img/otiluke.png" align="right" alt="otiluke-logo" title="Resilient Sphere of Otiluke">

Otiluke is a toolbox for deploying JS source-to-source compilers (aka JS transpilers) written as *sphere*.
A sphere is a node module adhering to an interface defined in this module.  
Otiluke is itself a [npm module](https://www.npmjs.com/package/otiluke) and can be installed with `npm install otiluke`.
You can try out Otiluke [here](http://rawgit.com/lachrist/otiluke/master/usage/demo.html).
Otiluke features four tools:

1. [Mitm](#mitm): deploy spheres on the client tier of web applications [usage](usage/run-node.js).
2. [Node](#node): deploy spheres on node applications.
3. [Test](#test): debug and benchmark spheres.
4. [Demo](#demo): demonstrate how awesome are your log-spheres.

## Mitm

Otiluke deploys spheres to client tiers by essentially performing a man-in-the-middle attack with a forward proxy.
Such attack require the browser to trust Otiluke's root certificate and redirect all its request to the forward proxy.
We detail this procedure for firefox in [Firefox Configuration](#firefox-configuration).

<img src="img/mitm.png" align="center" title="The Otiluke mitm communication model"/>

After deployment, the sphere has been [browserified](http://browserify.org) into the client tier.
This Otiluke proxy is parametrized by an object called *hijack* which intercept the communication from the client tier.
The above schema depicts a typical use case where the sphere module and the hijack object only communicate with eachother.
But nothing prevent the sphere module to communicate with the server tier and/or the hijack object to handle communication directed to the server tier.
Note that multiple clients can be connected at the same time.
Below is a running example (assuming that `sphere.js` `hijack.js` and `run-mitm.js` are in the same directory) which logs messages before and after executing every client scripts.

```js
// sphere.js //
var namespace = "_otiluke_";
module.exports = function (argument, channel) {
  global[namespace] = function (message) {
    channel.request("POST", "/"+argument, {}, message, true);
  };
  return function (script, source) {
    return [
      namespace+"("+JSON.stringify("before "+source)+");",
      script,
      namespace+"("+JSON.stringify("after "+source)+");",
    ].join("\n");
  };
};
```

```js
// hijack.js //
var Url = require("url");
module.exports = function (splitter) {
  return {
    request: function (req, res) {
      if (Url.parse(req.url).path !== "/"+splitter)
        return false;
      var message = "";
      req.on("data", function (data) { message += data });
      req.on("end", function () {
        console.log(message);
        res.writeHead(200, {
          "Content-Length": 0,
          "Content-Type": "text/plain"
        });
        res.end();
      });
      return true;
    },
    websocket: function (websocket) {
      return false;
    }
  };
};
```

```js
// run-mitm.js //
var Path = require("path");
var HttpServer = require("http-server");
var Otiluke = require("otiluke");
var Hijack = require("./hijack.js");
var splitter = Math.random().toString(36).substring(2);
Otiluke.mitm({
  hijack: Hijack(splitter),
  sphere: {
    path: Path.join(__dirname, "sphere.js"),
    argument: splitter
  }
}).listen(8080);
HttpServer.createServer({root:Path.join(__dirname, "html")}).listen(8000);
var cert = Path.join(__dirname, "..", "mitm", "proxy", "ca", "cacert.pem");
console.log([
  "1. Redirect your browser's requests to localhost:8080",
  "2. Make your browser trust Otiluke's root certificate at "+cert,
  "3. Visit http://localhost:8000/index.html"
].join("\n"));
```

N.B.:
* [Mitm](#mitm) requires [openssl](https://www.openssl.org/) to be in the PATH.
* External and inlined script are intercepted but *not* inline event handlers nor dynamically evaluated code.
* You can refresh every Otiluke certificates by calling `Otiluke.mitm.reset(callback)`.
  Note that after resetting you will have make your browser trust the newly created root certificate.

## The Sphere Module and the Hijack Object

An important property of Otiluke consists in providing an unified interface for deploying JS transpilers.
The mitm communication model presented in [Mitm](#mitm) motivates the interface for the other tools.
We now describe how sphere modules and hijack objects should look like for every Otiluke tools but [Demo](#demo).

1. Sphere Module: a node module performing JS transpilation:
  ```js
  module.exports = function (argument, channel) {
    return function (script, source) {
      var transpiled = ...;
      return transpiled;
    };
  };
  ```
  * `argument(json)`: static JSON data passed when calling Otiluke's tools.
  * `channel(channel-uniform)`: instance of [channel-uniform](https://www.npmjs.com/package/channel-uniform)
  * `script(string)`: original code
  * `source(string)`: origin of the script
  * `transpiled(string)`: transpiled script
2. Hijack Object: an JS object intercepting the communication from the transpiled application
  ```js
  var hijack = {};
  hijack.request = function (req, res) {
    var hijacked = ...;
    return hijacked;
  };
  hijack.websocket = function (ws) {
    var hijacked = ...;
    return hijacked;
  };
  ```
  * `req(http.IncomingMessage)`: http(s) request
  * `res(http.ServerResponse)`: http(s) response
  * `ws(ws.WebSocket)`: websocket
  * `hijacked(boolean)`: indicates whether the request/websocket was handeled.

## Node

Otiluke deploys spheres to node applications by modifying the require processus performed by node.
On the one hand this tool launch a server parametrized by a hijack object.
On the other hand this tool computes command line arguments that should be inserted into commands launching node applications.
For instance, `node main.js arg0 arg1` should be changed into `node <otiluke-argv> main.js arg0 arg1` where `<otiluke-argv>` is a placeholder for the aforementionned command line arguments.

<img src="img/mitm.png" align="center" title="The Otiluke mitm communication model"/>

After deployment, the sphere module has been required into the node application and can communicate with the hijack object.
As for [Mitm](#mitm), multiple node applications can be connected at the same time.
Below is a running example which reuses the files `sphere.js` and `hijack.js` from the example shown in [Mitm](#mitm).

```js
// run-node.js //
var Path = require("path");
var Otiluke = require("otiluke");
var Hijack = require("./hijack.js");
var splitter = Math.random().toString(36).substring(2);
var port = 8080;
var server = Otiluke.node.server(Hijack(splitter));
server.listen(port);
var argv = Otilule.node.argv({
  path: Path.join(__dirname, "sphere.js"),
  argument: splitter
}, port);
function escape (arg) {
  return "'"+arg.replace("'", "'''")+"'";
};
console.log("otiluke-argv: "+argv.map(escape).join(" "));
```

## Test

This tool deploys a server for debugging and benchmarking spheres.
Upon receiving a http request to a directory, this server will bundle every `.js` files present in the directory and return them along with a predifined sphere.   
Below is a running example which reuses the files `sphere.js` and `hijack.js` from the example shown in [Mitm](#mitm).
Assuming that the current working directory containt a subdirectory `standalone` with `fac.js` and `fibo.js`, the screen below can be obtained by visiting `http://localhost:8080/standalone`.

```js
// run-test.js //
var Path = require("path");
var Otiluke = require("otiluke");
var Hijack = require("./hijack.js");
var splitter = Math.random().toString(36).substring(2);
var server = Otiluke.test({
  basedir: process.cwd(),
  hijack: Hijack(splitter),
  sphere: {
    path: Path.join(__dirname, "sphere.js"),
    argument: splitter
  }
});
server.listen(8080);
```

<img src="img/test.png" align="center" title="Otiluke test"/>

## Demo

This last tool output html code which can be executed without server.

`otiluke --demo` [browserifies](http://browserify.org/) the given transpiler(s) and bundles the standalone script(s) into a standalone html page.
This page serves as a demonstration to these awesome transpiler(s) of yours.
Note that only the dependencies initially present in the given transpiler(s) will be bundled into the page, therefore arbitrary requires are not supported in the demo page.

```
// run-demo.js //
var Otiluke = require("otiluke");
var server = Otiluke.demo({
  basedir: process.cwd(),
  hijack: Hijack(splitter),
  sphere: {
    path: Path.join(__dirname, "sphere.js"),
    argument: splitter
  }
});
server.listen(8080);
```

```shell
otiluke --demo --transpile path/to/transpile[.js] --main path/to/main[.js] --out path/to/bundle.html
```
```javascript
require("otiluke").demo({
  transpile: "path/to/transpile",
  main: "path/to/main",
  out: "path/to/bundle.html"
});
```
## Subspheres

## Firefox Configuration

### Redirect requests to the MITM proxy

Second, you have to redirect all Firefox requests to the local port where the MITM proxy is deployed.
Go again to `about:preferences#advanced` then click on *Network* then *Settings...*.
You can now tick the checkbox *Manual proxy configuration* and *Use this proxy server for all protocols*.
The HTTP proxy fields should be the localhost `127.0.0.1` and the port given in the options.

<img src="img/firefox-proxy.png" align="center" alt="firefox proxy" title="Firefox's proxy settings"/>

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





















To make your transpiler work with Otiluke they should follow the template below.
We call such node module *sphere*.

```javascript
module.exports = function (argument, channel) {
  return function (script, source) {
    var transpiled = ...;
    return transpiled;
  };
};
```

* `argument(json)`: static JSON data passed when calling Otiluke's tools.
* `channel(channel-uniform)`: instance of [channel-uniform](https://www.npmjs.com/package/channel-uniform)
* `script(string)`: the original code
* `source(string)`: the origin of the script
* `transpiled(string)`: the transpiled script

The goal of the `channel` argument is to create a medium to communicate data to the external world.
It points to an Otiluke server which is parametrized by an object following the template below.
We call such object *hijack*

```
var hijack = {};
hijack.request = function (req, res) {
  var hijacked = ...;
  return hijacked;
};
hijack.websocket = function (ws) {
  var hijacked = ...;
  return hijacked;
};
```

* `req(http.IncomingMessage)`: 
* `res(http.ServerResponse)`: 
* `ws(ws.WebSocket)`: an 
* `hijacked(boolean)`: indicates wheter the request/websocket was intercepted.

For instance the sphere below modifies every intercepted script by adding log call before and after evaluating the script.

```javascript
var namespace = "_otiluke_namespace_";
module.exports = function (argument, tunnel) {
  global[namespace] = function (message) {
    tunnel.request("POST", "/_otiluke_splitter_", {}, message, true);
  };
  return function (script, source) {
    return [
      namespace+"("+JSON.stringify("begin "+source)+");",
      script,
      namespace+"("+JSON.stringify("end "+source)+");",
    ].join("\n");
  };
};
```

```
var Url = require("url");
var hijack = {};
hijack.request = function (req, res) {
  if (Url.parse(req.url).path !== "/_otiluke_splitter_")
    return false;
  var message = "";
  req.on("data", function (data) { message += data });
  req.on("end", function () {
    console.log(message);
  });
  return true;
};
```



The sphere interface suppose to have deploy a server 
is very generic and in many case only part.
For instance, a simple log channel is sufficient for many dynamic analysis.

```javascript
module.exports = function () {
  return function (script, source) {
    return [
      namespace+"("+JSON.stringify("begin "+source+"\n")+");",
      script,
      namespace+"("+JSON.stringify("end "+source+"\n")+");",
    ].join("\n");
  };
};
```

## Otiluke --node

`otiluke --node` deploys transpiler on node application(s).
Before being executed, every required module is intercepted and passed to the transpiler.
This transpilation process should work just fine in most cases but may not resist (yet) throughout introspection of the node module system.
For process lovers: `require("child_process").fork` is used with inherited standard streams.

```shell
otiluke --node --log-sphere /path/to/log-sphere.js --port 8080
```

Deploy a dedicated server:

```javascript
var Otiluke = require("otiluke");
var hijack = {
  request: function (req, res) { ... },
  socket: function (socket) { ... }
};
var sphere = {
  argument: 
};
var server = Otiluke.node.server(hijack);
server.listen(port);
var argv = Otiluke.node.argv()

  transpile: "path/to/transpile",
  main: "path/to/main",
  log: "path/to/log"
});
```

The transpiler module will always be executed side-by-side with the program targeted for transpilation.
Such online transpilation process enables easy support of dynamic code evaluations such as [`eval(script)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval).
As illustrated below and [here](http://rawgit.com/lachrist/otiluke/master/usage/demo.html), Otiluke provides a log channel in the options argument to trace information gathered during the transpilation process or later, while executing the transpiled program.

<img src="img/demo.png" align="center" alt="demo" title="otiluke --demo"/>

Otiluke's tools often understand the following important arguments: `--transpile` which points to the transpiler, `--main` which points to the entry point of the program to be transpiled, and `--log` which points to a log file for collecting the data sent through `Otiluke.log(string)`.
As demonstrated below, Otiluke's tools can often perform several transpilations at once if these arguments point to directories instead of files.
In such case, the resulting transpilations are the results of a [cartesian product](https://en.wikipedia.org/wiki/Cartesian_product) of the JavaScript files directly contained inside the `--transpile` and `--main` directory.
If `--log` points to a directory, Otiluke creates a new log file inside of it for every transpilations.
The names of these log files are URLs containing [hexadecimal escape sequences](https://mathiasbynens.be/notes/javascript-escapes#hexadecimal).
This illustrated below with Otiluke's test:

<img src="img/test.png" align="center" alt="test" title="otiluke --test"/>

```javascript
> require("fs").readdirSync("./usage/log").map(function (name) { return eval("'"+name+"'") })
[ '.gitignore',
  '/fac.js?transpile=identity.js#0',
  '/fac.js?transpile=logsource.js#0',
  '/fibo.js?transpile=identity.js#0',
  '/fibo.js?transpile=logsource.js#0' ]
```

Before going to each tool in detail, the table below recapitulates the options understood by each tool:

&nbsp;&nbsp;&nbsp;Argument&nbsp;&nbsp;&nbsp; | Shortcut | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Tool&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | Description
--------------|----------|-------------------|-----------------------------------------------------------------------------------------------------------------------------------------------
`--transpile` | `-t`     | all but `--mitm`  | Path to a transpiler or a directory of transpilers.
`--transpile` | `-t`     | `--mitm`          | Path to a transpiler.
`--port`      | `-p`     | `--test`          | Port to deploy a HTTP server; if omitted, a free random port is used.
`--port`      | `-p`     | `--mitm`          | Port to deploy a forward HTTP proxy; if omitted a free random port is used. 
`--main`      | `-m`     | `--demo`          | Path to a standalone script or a directory of standalone scripts.
`--main`      | `-m`     | `--node`          | Path to a node main file or directory of node main files.
`--log`       | `-l`     | all but `--demo`  | Path to a log file or a directory to be populated with log files; if omitted, all logs are redirected to `process.stdout`.
`--out`       | `-o`     | `--demo`          | Path to output the bundled html page.
`--reset`     | `-r`     | `--mitm`          | Reset all certificates created while performing previous man-in-the-middle attacks 

 -->