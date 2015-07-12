
// http-server ./test -p 80 -a 127.0.0.1
// node ./test/logger.js 8000
// iojs run.js    --namespace __hidden__    --initialize ./test/init.js    --http-port 8080    --ssl-port 8443    --origins localhost:8000    --help

window.__hidden__ = {
  eval: function (code) {
    var req = new XMLHttpRequest();
    req.open("POST", "http://localhost:8000", true);
    req.send(code);
    window.eval(code);
  }
};
