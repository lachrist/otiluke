
// iojs logger.js 8000 ./out.txt
// iojs run.js    --namespace __hidden__    --initialize ./test/initialize.js    --http-port 8080    --ssl-port 8443    --help

(function () {

  function log (msg) {
    var req = new XMLHttpRequest();
    req.open("POST", "http://localhost:8000", true);
    req.send(msg);
  }

  window.__hidden__ = {
    script: function (js, src) {
      log("\n\n\n\n============== "+(src||"Inline")+" ==============\n"+js);
      eval(js);
    },
    handler: function (node, name, js) {
      log("\n\n\n\n============== "+name+" ==============\n"+js);
      node[name] = Function("event", js);
    }
  };

} ())