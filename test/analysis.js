
// node ./test/logger.js 8888
// http-server ./test -p 80 -a 127.0.0.1
// mitmdump -p 8080 -s "proxy.py --analysis ./test/analysis.js --namespace grunty --port 8888 --host localhost"

(function () {

  window.grunty = {};
  window.grunty.eval = function (code) {
    var req = new XMLHttpRequest();
    req.open("post", "logger.txt", true);
    req.setRequestHeader("grunty", true);
    req.send(code);
    window.eval(code);
  }

} ());
