# Otiluke <img src="img/otiluke.png" align="right" alt="otiluke-logo" title="Resilient sphere of Otiluke">

Otiluke is a toolbox for deploying isomorphic JavaScript code transformers on node and browsers.

## Transform Module

The transform module receive an [Antena](https://github.com/lachrist/antena) (isomorphic http client), a parameter entered by the user and should asynchronously return a transformation function.

```js
module.exports = (antena, parameter, callback) => {
  // perform setup
  if (something_went_wrong) {
    callback(error);
  } else {
    callback(null, (script, source) => {
      // transform source
      return transformed_source;
    });
  }
};
```

## Subscribe Module

The subscribe module is only used by the CLI, not by the API.
It should subscribe to events emitted by otiluke servers.
* `request`: transform module called `antena.request(method, path, headers, body, [callback])`.
  * `request :: http.IncomingMessage`
    `request.url` is equal to `path`.
  * `response :: http.ServerResponse`
* `upgrade`: transform module called `antena.WebSocket(path)`.
  WebSocket libraries can handle this event to establish a proper WebSocket connection; e.g.: `ws.Server.handleUpgrade(request, socket, head)`.
  * `request :: http.IncomingMessage`
    `request.url` is equal to `path`.
  * `socket :: net.Socket`
  * `head :: Buffer`
* `error`: An error occurred.
  * `error :: Error`
  * `location :: string` OtilukeMitm only
  * `target :: object` OtilukeMitm only

```js
module.exports = (server) => {
  server.on("request", (request, response) => { ... });
  server.on("upgrade", (request, socket, head) => { ... });
  server.on("error", (error, location, target) => { ... });
};
```

## OtilukeMitm

OtilukeMitm transforms html pages served over http(s) by performing a man-in-the-middle attack with a forward proxy.
Such attack requires the browser to redirect all its request to the forward proxy.
For pages securly served over https it also requires the browser to trust the self-signed certificate at [mitm/ca/cert.pem](mitm/ca/cert.pem).
Examples: [test/mitm-hello.sh](test/mitm-hello.sh) and [test/mitm-google.sh](test/mitm-hello.sh).

<img src="img/mitm.png" align="center" title="OtilukeMitm"/>

### Redirect Firefox requests to the mitm proxy

Go to `about:preferences`, at the bottom of the *General* menu, click on *Settings...*.
Tick the checkbox *Manual proxy configuration* and *Use this proxy server for all protocols*.
The *HTTP Proxy* field should be *localhost* and the *Port* field should be were OtilukeMitm is listening.

<img src="img/firefox-proxy.png" align="center" title="Firefox's proxy settings"/>

### Make Firefox trust Otiluke's root certificate

This step is only required if you need to transform html pages securely served via https.
Go to `about:preferences`, at the bottom of the *Privacy & Security* menu, click on *View Certificates*.
Import Otiluke's root certificate which can be found by default at `otiluke/mitm/ca/cert.pem`.
Restart Firefox to avoid `sec_error_reused_issuer_and_serial` error.

<img src="img/firefox-cert.png" align="center" title="Firefox's proxy settings"/>

### Security Implication

Making a browser trust a root certificate has dire security consequences.
Everyone having access to the corresponding private key can falsify **any** identity on that browser (which is exactly what OtilukeMitm needs to do).
There is two ways approach this:
1. Not caring about security by using a dedicated browser and **never** fill in it any sensitive information.
2. Reset Otiluke's certificate authority to generate a new random private root key.
   Note that this root key is stored in plain text by default at `otiluke/mitm/ca/key.pem`, so makes sure that **absolutely** no one can access this file.
   We could have encrypted this key with a user password that should be entered every-time the mitm attack is deployed but we don't do that at the moment.

## OtilukeNode

OtilukeNode transform node applications by modifying the require procedure performed by node.
See [test/node.sh](test/node.sh) for example.

<img src="img/mitm.png" align="center" title="OtilukeNode"/>

## CLI

### `otiluke --node-server --port <number|path> --subscribe <path>`

* `--port <number|path>`:
  Local port or unix domain socket or windows pipe.
* `--subscribe <path>`:
  Path to subscribe module.
* `[--secure]`
  Use `https` or `http`
* `[--key]`
  Path to key file (only if `--secure` is enabled)
* `[--cert]`
  Path to certificate file (only if `--secure` is enabled)

### `otiluke --node-client --host <number|path|host> --transform <path> -- <path> arg0 arg1 ...`

* `--host <number|path|host>`:
    * `number`: Local port.
    * `path`: Unix domain socket or windows pipe.
    * `host`: `hostname[:port]`.
* `--transform`:
  Path to transform module.
* `[--secure]`
  Tells if the `antena` passed to the transform should perform secure communication.

### `otilule --mitm-proxy --port <number> --transform <path> --subscribe <path>`

* `--port <number>`: Port which the mitm proxy should listen to.
* `--transform <path>`: Path to transform module.
* `[--subscribe <path>]`: Path to subscribe module.
* `[--ca <path>]`, default: `otiluke/mitm/ca`.
  Path to certificate authority (directory where Otiluke will store openssl material).
* `[--http-splitter <string>]`, default: random value.
  Marker for recognizing communication from the transform module
* `[--transform-variable]`, default: random value.
  Global variable name used to store the transform function.
* `[--parameter-key <string>]`, default: `otiluke`.
  Url search key for retreiving the `parameter` argument to pass to the transform module.
* `[--server-namespace]`, default: timestamped random value in `/tmp` or in `\\pipe?\`.
  Path prefix before unix domain Socket or Windows pipe for mock servers.

### `otiluke --mitm-reset`

* `[--ca <path>]`, default `otiluke/mitm/ca`:
  Path to certificate authority 

## API

### `require("otiluke/node/client")({host, secure, transform, parameter, _})`

* `host :: number || string`
  A local port number or `hostname:port` or a Unix domain socket or a Windows pipe.
* `transform :: function`
  A function which has the same signature as the transform module.
* `parameter :: *`
  Some data to pass to the transform function.
* `_ :: [string]`
  The command line to execute, e.g: `["main.js", "arg0", "arg1"]`.

### `proxy = require("otiluke/mitm/proxy")({transform, ca, "http-splitter", "transform-variable", "parameter-key"})`

* `transform :: string`:
  Path to transform module.
* `ca :: string`, default `"otiluke/mitm/ca"`
  Path to certificate authority.
* `[--http-splitter <string>]`, default random value.
  Marker for recognizing communication from the transform module
* `[--transform-variable]`, default random value.
  Global variable name used to store the transform function.
* `[--parameter-key <string>]`, default `otiluke`:
  Url search key for retrieving the `parameter` argument to pass to the transform module.

### `require("otiluke/mitm/reset")({ca})`

* `ca :: string`, default `"otiluke/mitm/ca"`
  Path to certificate authority.
