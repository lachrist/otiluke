
// iojs logger.js 8000 ./out.txt
// iojs run.js    --namespace __hidden__    --initialize ./test/initialize.js    --http-port 8080    --ssl-port 8443    --help

window.__hidden__ = {
  eval: function (code) {
    var req = new XMLHttpRequest();
    req.open("POST", "http://localhost:8000", true);
    req.send(code);
    window.eval(code);
  }
};
