
// 1) Generate private key
// openssl genrsa -out key.pem 2048

// 2) Create certificate request
// openssl req -new -key ca-key.pem -out csr.pem
//
// Country Name (2 letter code) [AU]:
// State or Province Name (full name) [Some-State]:     
// Locality Name (eg, city) []:
// Organization Name (eg, company) [Internet Widgits Pty Ltd]:
// Organizational Unit Name (eg, section) []:
// Common Name (e.g. server FQDN or YOUR name) []:
// Email Address []:
//
// Please enter the following 'extra' attributes
// to be sent with your certificate request
// A challenge password []:
// An optional company name []:

// 3) Sign request with root-key:
// openssl x509 -req -in csr.pem -signkey key.pem -out cert.pem

var fs = require("fs");
var spawn = require("child_process").spawn;
var stream = require("stream");
var ca = {
  key: __dirname+"/ca/root-key.pem",
  cert: __dirname+"/ca/root-cert.pem"
}

module.exports = function (hostname, callback) {
  var files = {
    key: __dirname+"/ca/"+hostname+"-key.pem",
    csr: __dirname+"/ca/"+hostname+"-csr.pem",
    cert: __dirname+"/ca/"+hostname+"-cert.pem"
  };
  function read (callback) {
    fs.readFile(files.key, function (err, key) {
      if (err)
        return callback(new Error("cannot read key file "+files.key, +": "+err));
      fs.readFile(files.cert, function (err, cert) {
        if (err)
          return callback(new Error("cannot read key file "+files.cert, +": "+err));
        callback(null, key, cert);
      });
    });
  }
  read(function (err, key, cert) {
    if (!err)
      callback(null, key, cert);
    spawn("openssl", ["genrsa", "-out", files.key]).on("exit", function (code, signal) {
      console.log("GEN");
      if (code !== 0)
        return callback(new Error("openssl genrsa failed; code: "+code+" signal: "+signal));
      spawn("openssl", ["req", "-new", "-key", files.key, "-out", files.csr]).on("exit", function (code, signal) {
        console.log("REQ");
        if (code !== 0)
          return callback(new Error("openssl req failed; code: "+code+" signal: "+signal));
        spawn("openssl", ["ca", "-config", __dirname+"/ca/authority/openssl.cnf", "-in", files.csr, "-keyfile", ca.key, "-cert", ca.cert, "-out", files.cert], {stdio:["ignore","ignore",process.stderr]}).on("exit", function (code, signal) {
          console.log("CA");
          if (code !== 0)
            return callback(new Error("openssl ca failed; code: "+code+" signal: "+signal));
          read(callback);
        });
      }).stdin.write("\n\n\n\n\n"+hostname+"\n\n\n\n", "utf8");
    });
  });
};
