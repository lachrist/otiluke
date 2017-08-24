
var EmitterWebworker = require("antena/emitter/webworker");

EmitterWebworker.split("/otiluke-webworker").request("GET", "/", {}, "", function (status, reason, header, body) {
  var body = JSON.parse(body);
  VIRUS(body.parameter, EmitterWebworker, function (error, infect) {
    if (error)
      throw error;
    global.eval(infect(body.source, body.script));
  });  
});
