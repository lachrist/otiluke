
// openssl req -sha256 -nodes -newkey rsa:2048 -keyout key.pem -out csr.pem -subj "/CN=example.com"
// openssl x509 -CA  -req -in csr.pem -signkey key.pem -out crt.pem

var Fs = require("fs");
var Openssl = require("../../../common/openssl.js");

var ca = {
  cert: __dirname+"/cacert.pem",
  key: __dirname+"/cakey.pem",
  serial: __dirname+"/ca.srl"
};

function read (files, callback) {
  Fs.readFile(files.key, function (error, key) {
    if (error)
      return callback(err);
    Fs.readFile(files.cert, function (error, cert) {
      callback(error, {key:key, cert:cert});
    });
  });
}

module.exports = function (hostname, callback) {
  var files = {
    key: __dirname+"/keys/"+hostname+".pem",
    req: __dirname+"/reqs/"+hostname+".pem",
    cert: __dirname+"/certs/"+hostname+".pem"
  };
  Fs.readdir(__dirname+"/keys", function (error, filenames) {
    if (error)
      return callback(error);
    if (filenames.indexOf(hostname+".pem") !== -1)
      return read(files, callback);
    Openssl([
      "req",
      "-sha256",
      "-nodes",
      "-newkey", "rsa:2048",
      "-keyout", files.key,
      "-out", files.req,
      "-subj", "/CN="+hostname
    ], function (error) {
      if (error)
        return callback(error);
      Openssl([
        "x509",
        "-CA", ca.cert,
        "-CAkey", ca.key,
        "-CAserial", ca.serial,
        "-days", "3600",
        "-req", "-in", files.req,
        "-out", files.cert
      ], function (error) {
        if (error)
          return callback(error);
        read(files, callback)
      });
    });
  });
};
