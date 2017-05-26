# Otiluke <img src="img/otiluke.png" align="right" alt="otiluke-logo" title="Resilient Sphere of Otiluke">

Otiluke is a toolbox for deploying, debugging and demonstrating JavaScript code instrumenters.
Every Otiluke tool uniformely provides a channel to the instrumented application for communicating to the outside world.
Otiluke a [npm module](https://www.npmjs.com/package/otiluke) and can be installed with `npm install otiluke -g` and features four tools:

Tool          | Target             | Intended Purpose                    | Channel          | Usage Example
--------------|--------------------|-------------------------------------|------------------|---------------------------
[Mitm](#mitm) | served html pages  | instrument client tiers of web apps | forward proxy    | `otiluke --mitm --port 8080 --hijack example/hijack.js --hijack-argument foobar --sphere example/sphere.js --sphere-argument foobar`
[Node](#node) | node module        | instrument node applications        | auxillary server | `node example/run-node.js`
[Test](#test) | standalone scripts | debug and benchmark an instrumenter | static server    | `node example/run-test.js`
[Demo](#demo) | standalone scripts | debug and demonstrate instrumenters | simple logger    | `node example/run-demo.js`

## Mitm

Otiluke instruments served html pages over http(s) by essentially performing a man-in-the-middle attack with a forward proxy.
Such attack requires the browser to redirect all its request to the forward proxy.
For pages served over https it also requires the browser to trust the self-signed certificate at [mitm/proxy/ca/cacert.pem](mitm/proxy/ca/cacert.pem).
We detail these two procedures for Firefox [here](#browser-configuration).
`Otiluke.mitm` expects two node modules which are executed on different processes, we called them *hijack* and *sphere*.
As depicted below, the hijack module is executed on the forward proxy process and the sphere module is executed on the instrumented client process. 

<p align="center"><img src="img/mitm.png" title="The Otiluke mitm communication model"/></p>

After deployment, the forward proxy has been parametrized by the the hijack module and the sphere module has been [browserified](http://browserify.org) into the client tier.
The above schema depicts a typical use case where the sphere module and the hijack module only communicate with eachother.
But nothing prevent the sphere module to communicate with the server tier and/or the hijack object to handle communication directed to the server tier.
Note that multiple clients can be connected at the same time.
You can try out `Otiluke.mitm` by following the steps below:

1.From the installation directory, deploy the forward proxy on port 8080.
  In this example, the two arguments `--hijack-argument` and `--sphere-argument` should be equal as this value is used by the hijack module to differentiate between the communication from the sphere (meta) and the communication from the original client tier (base).
  We used the dummy string `foobar` but generally it is preferable to use a more complex name to avoid clashes.
  ```
  otiluke --mitm --port 8080 --hijack example/hijack.js --hijack-argument foobar --sphere example/sphere.js --sphere-argument foobar
  ```
2.From the installation direcotry, serve the html example on port 8000.
  For instance using [http-server](https://www.npmjs.com/package/http-server):
  ```
  http-server example/html -p 8000 
  ```
3. Configure you browser to redirect all communication to the proxy at `localhost:8080`. 
4. Instrument and evaluate client tiers by visiting: `http://localhost:8000/index.html`.

N.B.:
* An api is also available, see [example/run-mitm.js](example/run-mitm.js).
* To handle https connection, `Otiluke.mitm` requires [openssl](https://www.openssl.org/) to be available in the PATH.
* External and inlined script are intercepted but *not* inlined event handlers nor dynamically evaluated code.
* You can reset every Otiluke certificates by calling `otiluke --mitm --reset`.
  After resetting you will have to make your browser trust the new root certificate signed by the new randomly generated root key.

## The Sphere Module and the Hijack Module/Object

An important design decision of Otiluke consists in providing an unified interface for deploying JS instrumenters.
The communication model described in [Mitm](#mitm) motivates the interface for the other tools.
We now further describe this interface:

* Sphere Module (cli+api): performs JS instrumentation:
  ```js
  module.exports = function (argument, channel) {
    return function (script, source) { return instrumented };
  };
  ```
  * `argument(json)`: static data passed when calling Otiluke's tools, it is a string when using the cli and json data when using the api.
  * `channel(channel-uniform)`: instance of [channel-uniform](https://www.npmjs.com/package/channel-uniform) directed to an Otiluke server.
  * `script(string)`: original code
  * `source(string)`: origin of the script, can be an url or a path.
  * `instrumented(string)`: instrumented script
* Hijack Module (cli): intercepts the communication from the instrumented application
  ```js
  module.exports = function (argument) {
    return {
      request: function (req, res) { return hijacked },
      socket: function (ws) { return hijacked }
    };
  };
  ```
  * `argument(string)`
  * `req(http.IncomingMessage)`: http(s) request
  * `res(http.ServerResponse)`: http(s) response
  * `ws(ws.WebSocket)`: websocket
  * `hijacked(boolean)`: indicates whether the request/websocket was handeled.
* Hijack Object (api): same as the hijack module but for the api instead of the cli.
  ```js
  var hijack = {
    request: function (req, res) { return hijacked },
    socket: function (ws) { return hijacked }
  };
  ```

## Node

Otiluke instruments node applications by modifying the require processus performed by node.
`Otiluke.node` involves deploying an auxillary server to escape information to the outside world.
Command launching node applications should by modified to redirect to this server.
For instance, if the auxillary server is listening on port 8080 the command `node main.js arg0 arg1` should be changed into `otiluke 8080 main.js arg0 arg1`.
The schema below depicts the communication model of `Otiluke.node`:

<p align="center"><img src="img/node.png" title="The Otiluke node communication model"/></p>

After deployment, the auxillary server has been parametrized by the the hijack module and the sphere module has been required into the node application.
Multiple node applications can be connected at the same time.
You can try out `Otiluke.node` by following the steps below:

1. From the installation directory, deploy an auxillary server at port 8080:
   ```js
   otiluke --mitm --port 8080 --hijack example/hijack.js --hijack-argument foobar --sphere example/sphere.js --sphere-argument foobar
   ```
2. Instrument and evaluate node applications:
   ```
   otiluke 8080 example/node/cube.js 2
   ```

N.B.:
* An api is also available, see [example/run-node.js](example/run-node.js).
* The port can also be a path to a unix domain socket (faster).

## Test

Otiluke enables debugging and benchmarking JS instrumenters on standalone scripts.
`Otiluke.test` involves deploying a server for serving standalone scripts and escape information to the outside world.
You cna try out `Otiluke.test` by following the steps below: 

1. Deploy the test server at port 8080:
   ```js
   otiluke --test --basedir example --port 8080 --hijack example/hijack.js --hijack-argument foobar --sphere example/sphere.js --sphere-argument foobar
   ```
2. Instrument and evaluate every standalone scripts inside [example/standalone](example/standalone) by visiting http://localhost:8080/standalone.

N.B.:
* An api is also available, see [example/run-test.js](example/run-test.js).
* The standalone scripts should not have side effects nor should they listen to subsequent events.

## Demo

Otiluke enables debugging and demonstrating JS instrumenters on standalone scripts.
Unlike the other tools, `Otiluke.demo` does not rely on a additional server to escape information to the outside world.
Instead it simulate such connection from within the generated 
`Otiluke.demo` creates a standalone html page 

```js
var server = Otiluke.node.server(hijack)
server.listen(port);
var argv = Otiluke.node.argv({
  path: path,
  argument: argument,
}, port);
```

* `hijack(object)`: idem as `Otiluke.mitm`
* `path(string)`: path to the sphere module
* `argument(json)`: static json data that will be passed to every deployed sphere.
* `server(http.Server)`: forward proxy which acts as a man-in-the-middle.
* `port(number)`: port on which the forward proxy should listen 

* `hijack(object)`: same as the one given to `Otiluke.mitm`
* `server(http.Server)`: Http server 
* `path(string)`: path to the sphere module
* `argument(json)`: 
* `port(number)`:
* `argv(array)`: command line arguments to prepend before








We called the node module run on the forward proxy process *hijack* and the node module run on the instrumented tier process *sphere*.


In `Oti, the part of the instrumenter executed in the forward proxy is called *hijack* and the part of the instrumenter executed in the client tier is called *sphere*.
In `Otiluke.mitm`,
To run Transpilers must be separated into an 
Using `Otiluke.mitm` involves two 



```js
// hijack.js //
module.exports = function (argument) {
  return {
    request: function (req, res) { return hijacked },
    socket: function (ws) { return hijacked }
  };
};
```

```js
// sphere.js //
module.exports = function (argument, channel) {
  return function (script, source) {
    return instrumented;
  };
};
```

```js
server = Otiluke.mitm({
  hijack: {
    request: function (req, res) { return hijacked },
    socket: function (ws) { return hijacked }
  },
  sphere: {
    path: path,
    argument: argument
  }
});
server.listen(port);
```

* `req(http.IncomingMessage)`: intercepted http(s) request
* `res(http.ServerResponse)`: intercepted http(s) response
* `ws(ws.WebSocket)`: intercepted websocket
* `hijacked(boolean)`: indicates whether the request/websocket was handeled or if it should be forwarded to the server tier.
* `path(string)`: path to the sphere module below
* `argument(json)`: static json data that will be passed to every deployed sphere.
* `server(http.Server)`: forward proxy which acts as a man-in-the-middle.
* `port(number)`: port on which the forward proxy should listen 

```js
module.exports = function (argument, channel) {
  return function (script, source) {
    return instrumented;
  };
};
```

* `argument(json)`: JSON data passed when calling `Otiluke.mitm`.
* `channel(channel-uniform)`: instance of [channel-uniform](https://www.npmjs.com/package/channel-uniform) directed to the forward proxy.
* `script(string)`: original code whether it is an inlined or external.
* `source(string)`: url specifying the origin of the script
* `instrumented(string)`: instrumented script that will be executed in place of `script`


After deployment, the Otiluke proxy has been parametrized by the the hijack object and the sphere has been [browserified](http://browserify.org) into the client tier.
The above schema depicts a typical use case where the sphere module and the hijack object only communicate with eachother.
But nothing prevent the sphere module to communicate with the server tier and/or the hijack object to handle communication directed to the server tier.
Note that multiple clients can be connected at the same time.
You can try out the mitm tool be executing `node example/run-mitm.js` from the installation repository of this module.
Here are the important file involved in this example:
* [example/run-mitm.js](example/run-mitm.js):
  Deploy a forward proxy as well as a static file server.
  The string referred by `splitter` is used to distinguish the sphere communication from the rest.
  It is randomly generated and passed to the sphere module and the hijack object.
* [example/sphere.js](example/sphere.js):
  A simple JS instrumenter written as a sphere that send http post requests before and after executing any script.
* [example/hijack.js](example/hijack.js):
  Exports an object intercepting the communicaton from the instrumented application and logging http requests from the sphere.


## Node

Otiluke deploys spheres to node applications by modifying the require processus performed by node.
This tool does two things:
First it launches a server parametrized by a hijack object.
Second it computes command line arguments that should be inserted into commands launching node applications.
For instance, `node main.js arg0 arg1` should be changed into `node <otiluke-argv> main.js arg0 arg1` where `<otiluke-argv>` is a placeholder for the aforementionned command line arguments.

<p align="center"><img src="img/node.png" title="The Otiluke node communication model"/></p>

After deployment, the sphere module has been required into the node application and can communicate with the hijack object.
As for [Mitm](#mitm), multiple node applications can be connected at the same time.
You can try out the mitm tool be executing `node example/run-node.js` from the installation repository of this module.
The main file of this example, [node example](example/run-node.js), reuses [sphere.js](example/sphere.js) and [hijack.js](example/hijack.js) from the mitm example.

```js
var server = Otiluke.node.server(hijack)
server.listen(port);
var argv = Otiluke.node.argv({
  path: path,
  argument: argument,
}, port);
```

* `hijack(object)`: idem as `Otiluke.mitm`
* `path(string)`: path to the sphere module
* `argument(json)`: static json data that will be passed to every deployed sphere.
* `server(http.Server)`: forward proxy which acts as a man-in-the-middle.
* `port(number)`: port on which the forward proxy should listen 

* `hijack(object)`: same as the one given to `Otiluke.mitm`
* `server(http.Server)`: Http server 
* `path(string)`: path to the sphere module
* `argument(json)`: 
* `port(number)`:
* `argv(array)`: command line arguments to prepend before

## Test

This tool deploys a server for debugging and benchmarking spheres.
Upon receiving a http request to a directory, this server will bundle every `.js` files present in the directory and return them along with a predifined sphere.   
Below is the [test example](example/run-test.js) which reuses [sphere.js](example/sphere.js) and [hijack.js](example/hijack.js) from the mitm example.

```js
Otiluke.test({
  basedir: basedir,
  hijack: hijack,
  sphere: {
    path: path,
    argument: argument
  }
}).listen(port);
console.log("visit: http://localhost:8080/standalone");
```

<img src="img/test.png" title="Otiluke test"/>

## Demo

The demo tool is the only one that does not requires an auxiliary Otiluke server.
Which comes at the cost of losing some of the feature accessible to generic spheres.
The subclass of sphere accepted by the demo tool are called *log-spheres* which accept a simple logging function instead of the very generic `argument` and `channel`.
Here are the important file involved when executing `node example/run-demo.js`: 

* [run-demo.js](example/run-demo.js)
  ```js
  var Path = require("path");
  var Fs = require("fs");
  var Otiluke = require("otiluke");
  Otiluke.demo({
    "log-sphere": Path.join(__dirname, "log-sphere.js"),
    target: Path.join(__dirname, "standalone")
  }, function (error, html) {
    if (error)
      throw error;
    Fs.writeFileSync(Path.join(__dirname, "demo.html"), html, "utf8");
  });
  console.log("visit: file://"+Path.join(__dirname, "demo.html"));
  ```
* [log-sphere.js](example/log-sphere.js) 
  ```js
  var namespace = "_otiluke_";
  module.exports = function (log) {
    global[namespace] = log;
    return function (script, source) {
      return [
        namespace+"("+JSON.stringify("before "+source+"\n")+");",
        script,
        namespace+"("+JSON.stringify("after "+source+"\n")+");"
      ].join("\n");
    };
  };
  ```



Essentially the very generic couple `argument` and `channel` has been replace by a single logging function.






The downside 

Unlike the other tools, this tool does not requires an 
This last tool output html code which can be executed without server.

`otiluke --demo` [browserifies](http://browserify.org/) the given transpiler(s) and bundles the standalone script(s) into a standalone html page.
This page serves as a demonstration to these awesome transpiler(s) of yours.
Note that only the dependencies initially present in the given transpiler(s) will be bundled into the page, therefore arbitrary requires are not supported in the demo page.

```
var Path = require("path");
var Fs = require("fs");
var Otiluke = require("otiluke");
Otiluke.demo({
  "log-sphere": Path.join(__dirname, "log-sphere.js"),
  target: Path.join(__dirname, "standalone")
}, function (error, html) {
  if (error)
    throw error;
  Fs.writeFileSync(Path.join(__dirname, "demo.html"), html, "utf8");
});
console.log("visit: file://"+Path.join(__dirname, "demo.html"));
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

## Browser Configuration

### Redirect Firefox requests to the mitm proxy

First, you have to redirect all Firefox requests to the local port where the proxy from Otiluke mitm has been deployed.
Go to `about:preferences#advanced` then click on *Network* then *Settings...*.
You can now tick the checkbox *Manual proxy configuration* and *Use this proxy server for all protocols*.
The HTTP proxy fields should be the localhost `127.0.0.1` and the port on which proxy from the Otiluke mitm is listening.

<img src="img/firefox-proxy.png" align="center" alt="firefox proxy" title="Firefox's proxy settings"/>

### Make Firefox trust Otiluke's root certificate

Second, you have to indicate Firefox that you trust Otiluke's root certificate.
This step is only required if you need to transpiled clients securely served via https.
Go agains to `about:preferences#advanced` then click on *Certificates* then *View Certificates*.
You can now import Otiluke's root certificate which can be found at `/path/otiluke/mitm/ca/cacert.pem`.
After changes in certificates' trust, restart Firefox to avoid `sec_error_reused_issuer_and_serial` error.

<img src="img/firefox-cert.png" align="center" alt="firefox proxy" title="Firefox's proxy settings"/>

### Discussion on security

Making a browser trust a root certificate has dire security consequences.
Everyone having access to the corresponding private key can insurpate *any* identity within this browser.
Which is exactly what Otiluke mitm needs to do.
There is two ways approach this:
1. Not caring about security by using a dedicated browser and never fill in it any sensitive information (preferred).
2. Reset Otiluke certificate `Otiluke.mitm.reset(function (error) { ... })` to generate a new random private root key that must never be compromised.
   However the private root key is stored in plain (here)[mitm/proxy/ca/cakey.pem] because it needs to be accessed by Otiluke to sign new certificates.
   So makes sure that *absolutely* no one can access this file.

















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
As illustrated below and [here](http://rawgit.com/lachrist/otiluke/master/example/demo.html), Otiluke provides a log channel in the options argument to trace information gathered during the transpilation process or later, while executing the transpiled program.

<img src="img/demo.png" align="center" alt="demo" title="otiluke --demo"/>

Otiluke's tools often understand the following important arguments: `--transpile` which points to the transpiler, `--main` which points to the entry point of the program to be transpiled, and `--log` which points to a log file for collecting the data sent through `Otiluke.log(string)`.
As demonstrated below, Otiluke's tools can often perform several transpilations at once if these arguments point to directories instead of files.
In such case, the resulting transpilations are the results of a [cartesian product](https://en.wikipedia.org/wiki/Cartesian_product) of the JavaScript files directly contained inside the `--transpile` and `--main` directory.
If `--log` points to a directory, Otiluke creates a new log file inside of it for every transpilations.
The names of these log files are URLs containing [hexadecimal escape sequences](https://mathiasbynens.be/notes/javascript-escapes#hexadecimal).
This illustrated below with Otiluke's test:

<img src="img/test.png" align="center" alt="test" title="otiluke --test"/>

```javascript
> require("fs").readdirSync("./example/log").map(function (name) { return eval("'"+name+"'") })
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