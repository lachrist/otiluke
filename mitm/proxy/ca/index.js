
// openssl req -sha256 -nodes -newkey rsa:2048 -keyout key.pem -out csr.pem -subj "/CN=example.com"
// openssl x509 -CA  -req -in csr.pem -signkey key.pem -out crt.pem

var Fs = require("fs");
var Signal = require("../../../util/signal.js");
var Spawn = require("../../../util/spawn.js");

var ca = {
  cert: __dirname+"/cacert.pem",
  key: __dirname+"/cakey.pem",
  serial: __dirname+"/ca.srl"
};

function read (files, callback) {
  Fs.readFile(files.key, function (err, key) {
    if (err)
      return Signal("readFile " + files.key)(err);
    Fs.readFile(files.cert, function (err, cert) {
      if (err)
        return Signal("readFile " + files.cert)(err);
      callback(key, cert);
    });
  });
}

module.exports = function (hostname, callback) {
  var files = {
    key: __dirname+"/keys/"+hostname+".pem",
    req: __dirname+"/reqs/"+hostname+".pem",
    cert: __dirname+"/certs/"+hostname+".pem"
  };
  Fs.readdir(__dirname+"/keys", function (err, filenames) {
    if (err)
      return Signal("readdir ./ca/keys")(err);
    if (filenames.indexOf(hostname+".pem") !== -1)
      return read(files, callback);
    Spawn.async("openssl", [
      "req",
      "-sha256",
      "-nodes",
      "-newkey", "rsa:2048",
      "-keyout", files.key,
      "-out", files.req,
      "-subj", "/CN="+hostname], function (code) {
        code || Spawn.async("openssl", [
          "x509",
          "-CA", ca.cert,
          "-CAkey", ca.key,
          "-CAserial", ca.serial,
          "-days", "3600",
          "-req", "-in", files.req,
          "-out", files.cert], function (code) {
            code || read(files, callback);
          });
      });
  });
};
