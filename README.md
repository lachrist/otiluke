# Otiluke <img src="img/otiluke.png" align="right" alt="otiluke-logo" title="Resilient instrument of Otiluke">

Otiluke is a toolbox for developping JavaScript code transformers and deploying them on node and browsers.
Code transformation is a keystone technology for various kind of dynamic analyses such as tracers and profilers.
To use Otiluke, one may provide three distinct JS modules.
One, called *virus module*, should asynchronously return a code transformation function.
It will be executed on the same process as the application to be transformed (infected process).
The two others, called *onrequest module* and *onconnect module*, are listeners for respectively HTTP requests and WebSocket connections
They are both executed on a separated process which insert the virus into the application to be transformed (infector process).
Otiluke is a [npm module](https://www.npmjs.com/package/otiluke) and is better installed globally (ie: `npm install otiluke -g`).
Otiluke features four tools:

Tool Name     | Intended Purpose                    | Target Programs    | Infector Process
--------------|-------------------------------------|--------------------|-------------------
[Html](#html) | Transform client tiers of web apps  | Html pages         | Forward proxy
[Node](#node) | Transform node programs             | Node modules       | Auxillary server
[Eval](#eval) | Benchmark transformers              | Standalone scripts | File server
[Test](#test) | Test transformers                   | Standalone scripts | Infected process

Command Line Interface:

Argument Name          | Value Example          | Concerned Tools                           | Description
-----------------------|------------------------|-------------------------------------------|--------------------------------------------------------------
`--port`               | `8080`                 | [Html](#html) [Node](#node) [Eval](#eval) | communication between the infected and the infector processes
`--basedir`            | `path/to/basedir`      | [Eval](#eval)                             | base directory to look for standalone scripts
`--target`             | `path/to/standlone.js` | [Test](#test)                             | path to the standalone script to instrument
`--onrequest`          | `path/to/onrequest.js` | All                                       | path to an onrequest module
`--onconnect`          | `path/to/onconnect.js` | All                                       | path to an onconnect module
`--virus`              | `path/to/virus.js`     | All                                       | path to a virus module
`--virus-argument`     | `'{"json":"data"}'`    | All                                       | json data to pass to the virus module

## The Virus Module and the Intercept Object/Module

An important design decision of Otiluke consists in providing an unified interface for deploying JS code transformers.
The communication of [Html](#html) being the most constrainted, it dictates the communication interface for the other tools.
We now describe this communication interface for both the command line interface (cli) and the application programming interface (api):

* Sphere Module (cli+api): asynchronously creates a code transformation function:
  ```js
  module.exports = function (options, callback) {
    callback(function (script, source) {
      return transformed;
    });
  };
  ```
  * `options(object)`
  * `options.argument(json)`: static data passed when calling Otiluke.
  * `options.request(function)`: performs an http request to the infecter process:
    ```js
    var method = "POST";
    var path = "/echo/hello";
    var headers = {"content-length":7};
    var body = "Laurent";
    function onresponse (response) {
      if (response.status !== 200)
        throw new Error(response.status+" "+response.reason);
      console.log("Headers", response.headers);
      console.log("Body", response.body)
    }
    // Synchronous http request
    onresponse(options.request(method, path, headers, body));
    // Asynchronous http request
    options.request(method, path, headers, body, function (error, response) {
      if (error)
        throw error;
      onresponse(response);
    });
    ```
  * `options.connect(function)`: establish a [websocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocketxt) connection with the infecter process:
    ```
    var path = "/echo/hello"
    var websocket = options.connect(path);
    websocket.onopen = function () {
      websocket.send("Laurent");
    };
    websocket.onmessage = function (event) {
      console.log("Message", event.data);
      websocket.close(1000, "done");
    };
    websocket.onerror = function (error) {
      throw error;
    };
    websocket.onclose = function (event) {
      console.log("Close", event.code, event.reason);
    };
    ```
  * `callback(function)`: expects a code transformation function
  * `script(string)`: original code
  * `source(string)`: origin of the original code, can be an url or a path
  * `transformed(string)`: transformed code
* Onrequest Function (api): listener for http requests from infected processes:
  ```js
  var onrequest = function (req, res) { }
  ```
  * `req(http.IncomingMessage)`: http(s) request
  * `res(http.ServerResponse)`: http(s) response
* Onrequest Module (cli): exports an onrequest function:
  ```js
  module.exports = onrequest;
  ```
* Onconnect Function (api): listener for websocket connections form infected processes:
  ```js
  var onconnect = function (con) { };
  ```
  * `con(ws.WebSocket)`: [websocket](https://github.com/websockets/ws/blob/master/doc/ws.md#class-websocket), instance of [ws](https://www.npmjs.com/package/ws)
* Onconnect Function (cli): exports a onconnect function:
  ```js
  module.exports = onconnect;
  ```

## Html

OtilukeHtml transforms html pages served over http(s) by essentially performing a man in the middle attack with a forward proxy.
Such attack requires the browser to redirect all its request to the forward proxy.
For pages securly served over https it also requires the browser to trust the self-signed certificate at [mitm/proxy/ca/cacert.pem](mitm/proxy/ca/cacert.pem).
We detail these two procedures for Firefox [here](#browser-configuration).
After deployment, the virus can communicate with the onrequest and onconnect listeners.
Note that multiple infected processes can be connected at the same time.

<p align="center"><img src="img/html.png" title="The OtilukeHtml communication model"/></p>

You can try out OtilukeHtml by following the steps below (from the installation directory of this modules):
1. Deploy the forward proxy on port 8080 and the server tier on port 8000 by executing [example/run-html.js](example/run-html.js).
  Alternatively, you can run the two commands below in separated terminals:
  ```
  otiluke --html --port 8080 --onconnect example/onconnect.js --virus example/virus.js
  ```
  ```
  http-server example/html -p 8000
  ```
2. Make your browser redirect all its request to the forward proxy at `localhost:8080`.
3. Infect and execute the target client tier by visiting: `http://localhost:8000/index.html`.

N.B.:
* External and inlined script are intercepted but *not* inlined event handlers nor dynamically evaluated code.
* To handle https connection, OtilukeHtml requires [openssl](https://www.openssl.org/) to be available in the PATH.
* Otiluke acts as a certificate authority to perform the man in the middle attack.
  You can reset every issued Otiluke certificates by calling `otiluke --html --reset`.
  After resetting you will have to make your browser trust the new root certificate.

## Node

OtilukeNode transform node applications by modifying the require processus performed by node.
To ensure uniformity, OtilukeNode reproduces the communication model OtilukeHtml which involves deploying an auxillary server.
Command launching node applications should by modified to communicate to this auxillary server.
For instance, if the auxillary server is listening on port 8080 the command `node main.js arg0 arg1` should be changed into `otiluke 8080 main.js arg0 arg1`.
After deployment, the virus can communicate with the onrequest and onconnect listeners.
Note that multiple infected processes can be connected at the same time.

<p align="center"><img src="img/node.png" title="The OtilukeNode communication model"/></p>

You can try out OtilukeNode by following the steps below (from the installation directory of this module):

1. Deploy the auxillary server on port 8080 and the server tier on port 8000 by executing [example/run-html.js](example/run-html.js).
   Alternatively you can run the command:
   ```js
   otiluke --node --port 8080 --onconnect example/onconnect.js --virus example/virus.js
   ```
2. Infect and execute the target node application by running:
   ```
   otiluke 8080 example/node/cube.js 2
   ```

Note that the port argument can also be a path to a unix domain socket which is faster because it avoid the loopback at the network card.

## Eval

OtilukeTest enables debugging and benchmarking code transformers on standalone scripts.
OtilukeTest involves deploying a server for serving standalone scripts and escape information to the outside world.
You cna try out `Otiluke.test` by following the steps below: 

1. Deploy the test server at port 8080:
   ```js
   otiluke --eval --port 8080 --onconnect example/onconnect.js --virus example/virus.js
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
var server = Otiluke.node.server(intercept)
server.listen(port);
var argv = Otiluke.node.argv({
  path: path,
  argument: argument,
}, port);
```

* `intercept(object)`: idem as `Otiluke.mitm`
* `path(string)`: path to the instrument module
* `argument(json)`: static json data that will be passed to every deployed instrument.
* `server(http.Server)`: forward proxy which acts as a man-in-the-middle.
* `port(number)`: port on which the forward proxy should listen 

* `intercept(object)`: same as the one given to `Otiluke.mitm`
* `server(http.Server)`: Http server 
* `path(string)`: path to the instrument module
* `argument(json)`: 
* `port(number)`:
* `argv(array)`: command line arguments to prepend before








We called the node module run on the forward proxy process *intercept* and the node module run on the instrumented tier process *instrument*.


In `Oti, the part of the instrumenter executed in the forward proxy is called *intercept* and the part of the instrumenter executed in the client tier is called *instrument*.
In `Otiluke.mitm`,
To run Transpilers must be separated into an 
Using `Otiluke.mitm` involves two 



```js
// intercept.js //
module.exports = function (argument) {
  return {
    request: function (req, res) { return intercepted },
    socket: function (ws) { return intercepted }
  };
};
```

```js
// instrument.js //
module.exports = function (argument, channel) {
  return function (script, source) {
    return instrumented;
  };
};
```

```js
server = Otiluke.mitm({
  intercept: {
    request: function (req, res) { return intercepted },
    socket: function (ws) { return intercepted }
  },
  instrument: {
    path: path,
    argument: argument
  }
});
server.listen(port);
```

* `req(http.IncomingMessage)`: intercepted http(s) request
* `res(http.ServerResponse)`: intercepted http(s) response
* `ws(ws.WebSocket)`: intercepted websocket
* `intercepted(boolean)`: indicates whether the request/websocket was handeled or if it should be forwarded to the server tier.
* `path(string)`: path to the instrument module below
* `argument(json)`: static json data that will be passed to every deployed instrument.
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


After deployment, the Otiluke proxy has been parametrized by the the intercept object and the instrument has been [browserified](http://browserify.org) into the client tier.
The above schema depicts a typical use case where the instrument module and the intercept object only communicate with eachother.
But nothing prevent the instrument module to communicate with the server tier and/or the intercept object to handle communication directed to the server tier.
Note that multiple clients can be connected at the same time.
You can try out the mitm tool be executing `node example/run-mitm.js` from the installation repository of this module.
Here are the important file involved in this example:
* [example/run-mitm.js](example/run-mitm.js):
  Deploy a forward proxy as well as a static file server.
  The string referred by `splitter` is used to distinguish the instrument communication from the rest.
  It is randomly generated and passed to the instrument module and the intercept object.
* [example/instrument.js](example/instrument.js):
  A simple JS instrumenter written as a instrument that send http post requests before and after executing any script.
* [example/intercept.js](example/intercept.js):
  Exports an object intercepting the communicaton from the instrumented application and logging http requests from the instrument.


## Node

Otiluke deploys instruments to node applications by modifying the require processus performed by node.
This tool does two things:
First it launches a server parametrized by a intercept object.
Second it computes command line arguments that should be inserted into commands launching node applications.
For instance, `node main.js arg0 arg1` should be changed into `node <otiluke-argv> main.js arg0 arg1` where `<otiluke-argv>` is a placeholder for the aforementionned command line arguments.

<p align="center"><img src="img/node.png" title="The Otiluke node communication model"/></p>

After deployment, the instrument module has been required into the node application and can communicate with the intercept object.
As for [Mitm](#mitm), multiple node applications can be connected at the same time.
You can try out the mitm tool be executing `node example/run-node.js` from the installation repository of this module.
The main file of this example, [node example](example/run-node.js), reuses [instrument.js](example/instrument.js) and [intercept.js](example/intercept.js) from the mitm example.

```js
var server = Otiluke.node.server(intercept)
server.listen(port);
var argv = Otiluke.node.argv({
  path: path,
  argument: argument,
}, port);
```

* `intercept(object)`: idem as `Otiluke.mitm`
* `path(string)`: path to the instrument module
* `argument(json)`: static json data that will be passed to every deployed instrument.
* `server(http.Server)`: forward proxy which acts as a man-in-the-middle.
* `port(number)`: port on which the forward proxy should listen 

* `intercept(object)`: same as the one given to `Otiluke.mitm`
* `server(http.Server)`: Http server 
* `path(string)`: path to the instrument module
* `argument(json)`: 
* `port(number)`:
* `argv(array)`: command line arguments to prepend before

## Test

This tool deploys a server for debugging and benchmarking instruments.
Upon receiving a http request to a directory, this server will bundle every `.js` files present in the directory and return them along with a predifined instrument.   
Below is the [test example](example/run-test.js) which reuses [instrument.js](example/instrument.js) and [intercept.js](example/intercept.js) from the mitm example.

```js
Otiluke.test({
  basedir: basedir,
  intercept: intercept,
  instrument: {
    path: path,
    argument: argument
  }
}).listen(port);
console.log("visit: http://localhost:8080/standalone");
```

<img src="img/test.png" title="Otiluke test"/>

## Demo

The demo tool is the only one that does not requires an auxiliary Otiluke server.
Which comes at the cost of losing some of the feature accessible to generic instruments.
The subclass of instrument accepted by the demo tool are called *log-instruments* which accept a simple logging function instead of the very generic `argument` and `channel`.
Here are the important file involved when executing `node example/run-demo.js`: 

* [run-demo.js](example/run-demo.js)
  ```js
  var Path = require("path");
  var Fs = require("fs");
  var Otiluke = require("otiluke");
  Otiluke.demo({
    "log-instrument": Path.join(__dirname, "log-instrument.js"),
    target: Path.join(__dirname, "standalone")
  }, function (error, html) {
    if (error)
      throw error;
    Fs.writeFileSync(Path.join(__dirname, "demo.html"), html, "utf8");
  });
  console.log("visit: file://"+Path.join(__dirname, "demo.html"));
  ```
* [log-instrument.js](example/log-instrument.js) 
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
  "log-instrument": Path.join(__dirname, "log-instrument.js"),
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
## Subinstruments

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
We call such node module *instrument*.

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
We call such object *intercept*

```
var intercept = {};
intercept.request = function (req, res) {
  var intercepted = ...;
  return intercepted;
};
intercept.websocket = function (ws) {
  var intercepted = ...;
  return intercepted;
};
```

* `req(http.IncomingMessage)`: 
* `res(http.ServerResponse)`: 
* `ws(ws.WebSocket)`: an 
* `intercepted(boolean)`: indicates wheter the request/websocket was intercepted.

For instance the instrument below modifies every intercepted script by adding log call before and after evaluating the script.

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
var intercept = {};
intercept.request = function (req, res) {
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



The instrument interface suppose to have deploy a server 
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
otiluke --node --log-instrument /path/to/log-instrument.js --port 8080
```

Deploy a dedicated server:

```javascript
var Otiluke = require("otiluke");
var intercept = {
  request: function (req, res) { ... },
  socket: function (socket) { ... }
};
var instrument = {
  argument: 
};
var server = Otiluke.node.server(intercept);
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