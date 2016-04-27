
// openssl req -sha256 -nodes -newkey rsa:2048 -keyout key.pem -out csr.pem -subj "/CN=example.com"
// openssl x509 -CA  -req -in csr.pem -signkey key.pem -out crt.pem

var Fs = require("fs");
var Log = require("../../../util/log.js");
var ChildProcess = require("child_process");

var ca = {
  cert: __dirname+"/cacert.pem",
  key: __dirname+"/cakey.pem",
  serial: __dirname+"/ca.srl"
};

function read (files, callback) {
  Fs.readFile(files.key, function (err, key) {
    if (err)
      return Log("readFile " + files.key)(err);
    Fs.readFile(files.cert, function (err, cert) {
      if (err)
        return Log("readFile " + files.cert)(err);
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
      return Log("readdir ./ca/keys")(err);
    if (filenames.indexOf(hostname+".pem") !== -1)
      return read(files, callback);
    ChildProcess.spawn("openssl", [
      "req",
      "-sha256",
      "-nodes",
      "-newkey", "rsa:2048",
      "-keyout", files.key,
      "-out", files.req,
      "-subj", "/CN="+hostname]).on("close", function (code) {
        if (code)
          return Log("openssl req")(new Error(code));
        ChildProcess.spawn("openssl", [
          "x509",
          "-CA", ca.cert,
          "-CAkey", ca.key,
          "-CAserial", ca.serial,
          "-days", "3600",
          "-req", "-in", files.req,
          "-out", files.cert]).on("close", function (code) {
            if (code)
              return Log("openssl x509")(new Error(code));
            read(files, callback)
          });
      });
  });
};
