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


var fs = require("fs");
var spawn = require("child_process").spawn;
var options = {stdio:["pipe", "ignore", process.stderr]};
var ca = [fs.readFileSync(__dirname+"/ca/cacrt.pem")];

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
    spawn("openssl", ["genrsa", "-out", files.key, "2048"], options).on("exit", function (code, signal) {
      if (code !== 0)
        return callback(new Error("openssl genrsa failed; code: "+code+" signal: "+signal));
      spawn("openssl", ["req", "-new", "-sha256", "-key", files.key, "-out", files.req], options).on("exit", function (code, signal) {
        if (code !== 0)
          return callback(new Error("openssl req failed; code: "+code+" signal: "+signal));
        spawn("openssl", ["ca", "-config", __dirname+"/ca/minimal-ca.cnf", "-in", files.req, "-out", files.crt], options).on("exit", function (code, signal) {
          if (code !== 0)
            return callback(new Error("openssl ca failed; code: "+code+" signal: "+signal));
          read(callback);
        }).stdin.write("y\ny\n", "utf8");
      }).stdin.write("\n\n\n\n\n"+hostname+"\n\n\n\n", "utf8");
    });
  });
};
