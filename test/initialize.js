
// iojs logger.js 8000 ./out.txt
// iojs run.js    --namespace __hidden__    --initialize ./test/initialize.js    --http-port 8080    --ssl-port 8443    --help

window.__hidden__ = {
  script: function (code, src) {
    var req = new XMLHttpRequest();
    req.open("POST", "http://localhost:8000", true);
    req.send("\n\n\n\n============== "+(src||"Inline")+" ==============\n"+code);
    window.eval(code);
  },
  handler: function (code, node, name) {}
};
