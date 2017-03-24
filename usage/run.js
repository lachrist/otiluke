
// node usage/run.js --node

var Otiluke = require("otiluke");

function log (x) { process.stdout.write(x) }

function channel (comp, main) {
  log(JSON.stringify(main)+" x "+JSON.stringify(comp)+"...\n");
  return {
    onsocket: function (socket) {
      socket.onmessage = function (event) { log("socket >> "+event.data+"\n") };
    },
    onrequest: function (req, res) {
      res.writeHead(200);
      var buffers = [];
      req.on("data", function (buffer) { buffers.push(buffer) });
      req.on("end", function () {
        log(req.method+" "+req.url+" "+Buffer.concat(buffers).toString("utf8")+"\n");
        res.end("ok", "utf8");
      });
    }
  };
};

switch (process.argv[2]) {
  case "--node": Otiluke.node({
    comp: __dirname+"/compile.js",
    mains: [
      __dirname+"/node/circle.js 123",
      __dirname+"/node/sphere.js 456"
    ],
    channel: channel
  }, function (results) {
    console.log(results[0].stderr);
    console.log("Otiluke --node returned with: "+JSON.stringify(results, null, 2));
  });
  case "--test":
  case "--demo":
  case "--mitm":
}
