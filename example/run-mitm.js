require("otiluke/html")({
  onconnect: require("./onconnect.js"),
  virus: __dirname+"/virus.js"
}).listen(8080);
require("http-server").createServer({
  root: __dirname+"/html"
}).listen(8000);