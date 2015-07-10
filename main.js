
var fs = require("fs");
var url = require("url");
var http = require("http");
var Intercept = require("./intercept.js")
var template = fs.readFileSync(__dirname+"/template.js", {encoding:"utf8"});

module.exports = function (namespace, initialize, proxy, hijack) {
  
  namespace = namespace || "otiluke";
  initialize = initialize || ("window."+namespace+" = {eval:eval};");
  initialize += template.replace(/@NAMESPACE/g, namespace);
  proxy = proxy || {};
  proxy.http = proxy.http || 8080;
  proxy.ssl = proxy.ssl || 8443;
  hijack = hijack || {};
  hijack.host = hijack.host || "127.0.0.1";
  hijack.port = hijack.port || 8000;

  http.createServer(function(req, res) {
    var split = namespace in req.headers;
    var parts = url.parse(req.url);
    var options = {
      hostname: split ? hijack.host : parts.host,
      port: split ?  hijack.port : parts.port,
      method: req.method,
      headers: req.headers,
      path: parts.path
    };
    var pReq = http.request(options, function (pRes) {
      var type = pRes.headers["content-type"];
      if (type || type.indexOf("text/html") !== -1) {
        delete pRes.headers["content-length"];
        res.writeHead(pRes.statusCode, pRes.statusMessage, pRes.headers);
        Intercept(pRes, res, initialize, namespace);
      } else {
        res.writeHead(pRes.statusCode, pRes.statusMessage, pRes.headers);
        pRes.pipe(res);
      }
    });
    req.pipe(pReq);
  }).listen(proxy.http);

}



    // if (split)
    //   options.port = hijack.port;
    // else if (parts.protocol === "http")
    //   options.port = 80;
    // else if (parts.protocol === "https")
    //   options.port = 443;
    // else
    //   throw new Error("Cannot deduce port for "+options);



// var proxy = HttpProxy.createProxyServer();

// var server = http.createServer(function (req, res) {
//   var urlObj = url.parse(req.url);
//   req.headers.host = urlObj.host;
//   req.url = urlObj.path
//   // var url = url.parse(req.url);
//   // req.headers.host = url.host;
//   // req.url = url.path;
//   proxy.web(req, res, {target:req.url}, function (e) {
//     console.log(e);
//   });
// });
// server.listen(8080);

// var sproxy = HttpProxy.createProxyServer({
//   target: "https://localhost:9443",
//   ssl: {
//     key: FileSystem.readFileSync(__dirname+"/server.key"),
//     cert: FileSystem.readFileSync(__dirname+"/server.crt")
//   }
// });
// sproxy.listen(8080);



//   var proxy_request = proxy.request(request.method, request.url, request.headers);
//   proxy_request.addListener('response', function (proxy_response) {
//     proxy_response.addListener('data', function(chunk) {
//       response.write(chunk, 'binary');
//     });
//     proxy_response.addListener('end', function() {
//       response.end();
//     });
//     response.writeHead(proxy_response.statusCode, proxy_response.headers);
//   });
//   request.addListener('data', function(chunk) {
//     proxy_request.write(chunk, 'binary');
//   });
//   request.addListener('end', function() {
//     proxy_request.end();
//   });
// }).listen(8080);