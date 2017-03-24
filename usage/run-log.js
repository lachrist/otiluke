
var Otiluke = require("otiluke");

function log (x) { process.stdout.write(x+"\n") }

// {main, comp, send}
function channel (options) {
  var info = "run ["+options.target+"] compiled by ["+options.sphere+"]";
  log("BEGIN "+info);
  return {
    onclose: function () { log("END "+info) }, 
    onmessage: function (data) { log(data) },
    onrequest: function (req, res) { },
  };
};

switch (process.argv[2]) {
  case "--node": Otiluke.node({
    sphere: __dirname+"/log.js",
    targets: [
      __dirname+"/node/circle.js 123",
      __dirname+"/node/sphere.js 456"
    ],
    channel: channel
  }, function (results) {
    log("Results: "+JSON.stringify(results, null, 2));
  });
  case "--test":
  case "--demo":
  case "--mitm":
}
