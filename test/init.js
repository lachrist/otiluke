
// http-server ./test -p 80 -a 127.0.0.1
// node ./test/logger.js 8000
// iojs run.js    --namespace __hidden__    --initialize ./test/init.js    --http-port 8080    --ssl-port 80443    --origins localhost:8000    --help

window.__hidden__ = {};

window.__hidden__.eval = function (code) {
  console.log("CODE "+code);
  var req = new XMLHttpRequest();
  req.open("POST", "http://localhost:8000", true);
  req.onreadystatechange = function () {
    if (this.readyState === 4) {
      console.log(req.status);
      console.log(req.resonseText);
    }
  }
  req.send(code);
  window.eval(code);
}
