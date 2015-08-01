// node -pe process.versions
// openssl version


// 1) Generate private key
// openssl genrsa -out key.pem 2048


// 2) Create certificate request
// openssl req -new -sha256 -key ca/keys/HOSTNAME.pem -out ca/reqs/HOSTNAME.pem
//
// Country Name (2 letter code) [AU]:
// State or Province Name (full name) [Some-State]:     
// Locality Name (eg, city) []:
// Organization Name (eg, company) [Internet Widgits Pty Ltd]:
// Organizational Unit Name (eg, section) []:
// Common Name (e.g. server FQDN or YOUR name) []:HOSTNAME
// Email Address []:
//
// Please enter the following 'extra' attributes
// to be sent with your certificate request
// A challenge password []:
// An optional company name []:


// 3) Sign request with ca key:
// openssl ca -config minimal-ca.cnf -in ca/reqs/HOSTNAME.pem -out ca/crts/HOSTNAME.pem
// Check that the request matches the signature
// Signature ok
// The Subject's Distinguished Name is as follows
// countryName           :PRINTABLE:'AU'
// stateOrProvinceName   :PRINTABLE:'Some-State'
// organizationName      :PRINTABLE:'Internet Widgits Pty Ltd'
// commonName            :PRINTABLE:'HOSTNAME'
// Certificate is to be certified until Jul 20 11:00:57 2016 GMT (365 days)
// Sign the certificate? [y/n]:y
//
//
// 1 out of 1 certificate requests certified, commit? [y/n]y
// Write out database with 1 new entries
// Data Base Updated

// openssl req -nodes -newkey rsa:2048 -keyout example.key -out example.csr -subj "/C=GB/ST=London/L=London/O=Global Security/OU=IT Department/CN=example.com"

// openssl req -nodes -newkey rsa:2048 -keyout example.key -out example.csr -subj "/C=GB/ST=London/L=London/O=Global Security/OU=IT Department/CN=example.com"


// openssl genrsa -out key.pem 2048
// openssl req -new -sha256 -key ca-key.pem -out csr.pem
// openssl x509 -req -in csr.pem -signkey key.pem -out cert.pem


var fs = require("fs");
var spawn = require("child_process").spawn;
var options = {stdio:["ignore", "ignore", process.stderr]};
var ca = {
  crt: __dirname+"/ca/cacrt.pem",
  key: __dirname+"/ca/cakey.pem",
  ser: __dirname+"/ca/serial"
};

module.exports = function (hostname, callback) {
  var files = {
    key: __dirname+"/ca/keys/"+hostname+".pem",
    req: __dirname+"/ca/reqs/"+hostname+".pem",
    crt: __dirname+"/ca/crts/"+hostname+".pem"
  };
  function read (callback) {
    fs.readFile(files.key, function (err, key) {
      if (err)
        return callback(new Error("cannot read key file "+files.key, +": "+err));
      fs.readFile(files.crt, function (err, crt) {
        if (err)
          return callback(new Error("cannot read key file "+files.crt, +": "+err));
        callback(null, key, crt);
      });
    });
  }
  read(function (err, key, crt) {
    if (!err)
      return callback(null, key, crt);
    spawn("openssl", ["req", "-sha256", "-nodes", "-newkey", "rsa:2048", "-keyout", files.key, "-out", files.req, "-subj", "/CN="+hostname], options).on("exit", function (code, signal) {
      if (code !== 0)
        return callback(new Error("openssl req failed; code: "+code+" signal: "+signal));  
      spawn("openssl", ["x509", "-CA", ca.crt, "-CAkey", ca.key, "-CAserial", ca.ser, "-req", "-in", files.req, "-out", files.crt], options).on("exit", function (code, signal) {
        if (code !== 0)
          return callback(new Error("openssl ca failed; code: "+code+" signal: "+signal));
        read(callback);
      });
    });
  });
};
