# Otiluke <img src="img/otiluke.png" align="right" alt="otiluke-logo" title="Resilient sphere of Otiluke">

Toolbox for deploying JavaScript code transformers written in JavaScript themselves on node and browsers.

## Virus Interface

In Otiluke, code transformers should adhere to the virus interface.

```js
module.exports = (argm) => (source, script) => [
  "console.log("+JSON.stringify(argm.begin+script)+");",
  script,
  "console.log("+JSON.stringify(argm.end+script)+");"
].join("\n");
```

Calling context of virus functions:

```
virus = Virus(argm);
script2 = virus(script1, source);
```

* `argm :: {string}`:
  A mapping of user-defined arguments.
* `script1 :: string`:
  The original script.
* `source :: string`
  For `otiluke/node` it is an absolute path to a node module.
  For `otiluke/browser`, it is either a url to a javascript file for external scripts or the url of the current page for inline script.
  In the later case the hash part of the url will be a number indicating the position of the inline script in the original html tree.
* `script2 :: string`:
  The transformed script

## OtilukeBrowser

OtilukeBrowser modifies html pages served over http(s) by performing a man-in-the-middle attack with a forward proxy.
Such attack requires the browser to redirect all its request to the forward proxy.
For pages securely served over https it also requires the browser to trust the self-signed certificate at [browser/ca/cert.pem](browser/ca/cert.pem).
Examples: [test/browser/run-hello.sh](test/browser/run-hello.sh) and [test/browser/run-google.sh](test/browser/run-google.sh).

<img src="img/browser.png" align="center" title="OtilukeBrowser"/>

### `require("otiluke/browser").initialize(options)`

Upon calling this submodule, Otiluke will prepare a directory to serve as a certificate authority.
That the end, this directory will be populated with the subdirectories: `req`, `key` and `cert` and the files: `req.pem`, `key.pem` and `cert.pem`.
To make a browser trust Otiluke, you will need to import `cert.pem` which is Otiluke's root certificate.

**Warning**
Making a browser trust a root certificate implies *serious* security consequences.
Everyone having access to the corresponding private key can falsify *any* identity on that browser (which is exactly what OtilukeBrowser needs to do).
To avoid security breach, we recommend to use a dedicated browser and *never* fill in it any sensitive information.

* `options.home :: string`, default `"node_modules/otiluke/browser/ca-home"`:
    Path to a certificate authority directory.
* `options.subj :: string`, default `"/CN=otiluke/O=Otiluke"`:
  The `-subj` argument to pass to [`openssl -req`](https://www.openssl.org/docs/manmaster/man1/req.html).

Alternatively, if Otiluke is installed globally, the `otiluke-browser-ca` command can be used:

```
otiluke-browser --initialize [--ca-home <path>] [--subj arg]
```

* `--ca-home`, default `node_modules/otiluke/browser/ca-home`:
  Path to a certificate authority directory.
* `--subj`, default `/CN=otiluke/O=Otiluke`:
  The `-subj` argument to pass to [`openssl -req`](https://www.openssl.org/docs/manmaster/man1/req.html).

### `listeners = require("otiluke/browser/listeners")(vpath, [options])`

Create listeners for a man-in-the-middle proxy.

* `vpath :: string`:
  Path to a virus module.
* `options :: object`
  * `ca-home :: string`, default `"node_modules/otiluke/browser/ca-home"`
    Path to a certificate authority directory.
  * `ipc-dir :: string`, default `"/tmp/"` (`"\\?\pipe"` on windows).
    Address namespace for local communication.
  * `argm-prefix :: string`, default `"otiluke-"`:
    Prefix to look for in the search part of the url to create the `argm` object.
    For instance, the url `http://example.com/path?otiluke-foo=123&otiluke-bar=456&qux=789` will result into `{foo:123, bar:456}` being passed to the virus module.
  * `virus-var :: string`, default `__OTILUKE__`.
    Global variable name used to store the transformation function.
  * `handlers :: object`, default `{}`.
    A set a function defined by the user to monitor Otiluke's activity and intercept traffic.
    In particular, these handlers can be used to filter out information gathered by the virus module.
    * `handled = handlers.request(request, response)`
      Called whenever a regular request is intercepted by either the proxy or one of the forged servers.
      Unless this function return a truthy value, Otiluke will forward the regular request to the rightful address.
      * `request :: http(s).IncomingMessage`
      * `response :: http(s).ServerResponse`
      * `handled :: boolean`
    * `handled = handlers.connect(request, socket, head)`
      Called whenever a connect request is intercepted by one of the forged servers.
      Unless this function return a truthy value, Otiluke will forward the connect request to the rightful address and blindly relay subsequent traffic.
      * `request :: http(s).IncomingMessage`
      * `socket :: (net|tls).Socket`
      * `head :: Buffer`
      * `handled :: boolean`
    * `handled = handlers.upgrade(request, socket, head)`
      Called whenever a connect request is intercepted by either the proxy or one of the forged servers.
      Unless this function return a truthy value, Otiluke will forward the upgrade request to the rightful address and blindly relay subsequent traffic.
      * `request :: http(s).IncomingMessage`
      * `socket :: (net|tls).Socket`
      * `head :: Buffer`
      * `handled :: boolean`
    * `forgery(hostname, server)`
      Called whenever a hostname is being impersonated.
      * `hostname :: string`
      * `server :: https.Server`
    * `activity(description, origin, emitter)`
      Called whenever
      * `description :: string`
        * `server-regular-request`
        * `client-regular-request`
        * `server-regular-response`
        * `client-regular-response`
        * `server-connect-request`
        * `server-connect-socket`
        * `client-connect-socket`
        * `server-upgrade-request`
        * `server-upgrade-socket`
        * `client-upgrade-socket`
      * `origin :: http(s).Server`
      * `emitter :: http(s).IncomingMessage | http(s).ClientRequest | http(s).ServerResponse | (net|tls).Socket`
* `listeners :: object`
  These event listeners should be registered to a user-created `http.Server` to setup the man-in-the-middle attack.
  * `listeners.request(request, response)`
  * `listeners.upgrade(request, socket, head)`
  * `listeners.connect(request, socket, head)`

### Redirect the browser requests to the man-in-the-middle proxy

#### Firefox

Go to `about:preferences`, at the bottom of the *General* menu, click on *Settings...*.
Tick the checkbox *Manual proxy configuration* and *Use this proxy server for all protocols*.
The *HTTP Proxy* field should be *localhost* and the *Port* field should refer to the port to which is the proxy is listening.

<img src="img/firefox-proxy.png" align="center" title="Firefox's proxy settings"/>

#### Chrome

Use the `--proxy-server` switch.
For instance, on OSX:

```
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --proxy-server=127.0.0.1:8080
```

#### System

System-level proxy settings should also work but it will redirect *every* HTTP(S) request performed by your system.
In OSX, system-level proxy settings are available in: `System Preferences` > `Network` > `Advanced...` > `Proxies`.

<img src="img/osx-proxy.png" align="center" title="OSX's proxy settings"/>

### Make browsers trust Otiluke's root certificate

This step is only required if you need to infect html pages securely served over https.

#### Firefox

Go to `about:preferences`, at the bottom of the *Privacy & Security* menu, click on *View Certificates*.
Import Otiluke's root certificate an restart Firefox to avoid `sec_error_reused_issuer_and_serial` error.

<img src="img/firefox-cert.png" align="center" title="Firefox's certificate settings"/>

#### System

Otiluke's root certificate can also be trusted at the system level but that means that *every* browser will trust otiluke's signed certificate.
If your certificate authority directory is compromised, data can be stolen from each one of your browsers.
In OSX, go to `Keychain Access` > `Files` > `Import Items` and select Otiluke's root certificate.

<img src="img/osx-cert.png" align="center" title="OSX's certificate settings"/>

## OtilukeNode

OtilukeNode infects node applications by modifying the require procedure performed by node.
See [test/node.sh](test/node.sh) for example.

<img src="img/node.png" align="center" title="OtilukeNode"/>

### `require("otiluke/node")(Virus, options)`

* `Virus :: function`:
  Virus constructor (function exported by a virus module).
* `options :: object`
  * `_ :: array`
  * `...`:
    Remaining properties will be used to compute argument mapping `argm` passed to `virus`.

Alternatively, if Otiluke is installed globally, the `otiluke-node` command can be used:

```
otiluke-node --virus <path> ... -- <target-command>`
```

* `--virus`:
  Path to a virus module.
* `--host <number|path|host>`:
  Defines the host to which the `antena` passed to the virus module should be directed.
    * `number`: Local port.
    * `path`: Unix domain socket or windows pipe.
    * `host`: `hostname[:port]`.
* `[--secure]`
  Tells if the `antena` passed to the virus module should perform secure communication.
* `...`
  Additional arguments will be passed as `argm` properties to the virus module. 
* `--`:
  The double dash separates Otiluke-related arguments from the target node command.
