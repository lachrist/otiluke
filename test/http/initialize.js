
// iojs run.js \
//   --port        8080 \
//   --namespace   __hidden__ \
//   --init-file   ./test/initialize.js \
//   --log-level   error \
//   --record-port 8000 \
//   --record-file ./test/out.txt


function log (msg) {
  var req = new XMLHttpRequest();
  req.open("POST", "https://localhost:8000", true);
  req.send(msg);
}

window.__hidden__ = {
  script: function (js, src) {
    log("\n\n\n\n============== "+(src||"script")+" ==============\n"+js);
    return eval(js);
  },
  handler: function (node, name, js) {
    log("\n\n\n\n============== "+name+" ==============\n"+js);
    node[name] = Function("event", js);
  }
};
