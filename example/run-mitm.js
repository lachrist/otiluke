var Path = require("path");
var OtilukeMitm = require("otiluke/mitm");
var Hijack = require("./hijack.js");
var splitter = Math.random().toString(36).substring(2);
OtilukeMitm({
  hijack: Hijack(splitter),
  sphere: {
    path: Path.join(__dirname, "sphere.js"),
    argument: splitter
  }
}).listen(8080);
require("http-server").createServer({root:Path.join(__dirname, "html")}).listen(8000);
var cert = Path.join(__dirname, "..", "mitm", "proxy", "ca", "cacert.pem");
console.log([
  "1. Redirect your browser's requests to localhost:8080",
  "2. Make your browser trust Otiluke's root certificate at "+cert,
  "3. Visit http://localhost:8000/index.html"
].join("\n"));