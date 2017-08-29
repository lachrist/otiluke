var Fs = require("fs");
var Openssl = require("./openssl.js");
var RendezVous = require("./common/rendez-vous.js");

function clean (name, callback) {
  Fs.readdir(Path.join(__dirname, name), function (error, filenames) {
    if (error)
      return callback(error);
    var rdv = RendezVous(filenames.length, callback);
    filenames.forEach(function (filename) {
      if (filename === ".gitignore")
        return rdv(null);
      Fs.unlink(Path.join(__dirname, name, filename), rdv);
    });
  });
}

module.exports = function (callback) {
  var rdv = RendezVous(3, function (error) {
    if (error)
      return callback(error);
    Fs.writeFile(__dirname+"/ca.srl", "01", function (error) {
      if (error)
        return callback(error);
      Openssl([
        "genrsa",
        "-out", __dirname+"/cakey.pem",
        "2048"
      ], function (error) {
        if (error)
          return callback(error);
        Openssl([
          "req",
          "-new",
          "-sha256",
          "-subj", "/CN=otiluke/O=Otiluke",
          "-key", __dirname+"/cakey.pem",
          "-out", __dirname+"/careq.pem"
        ], function (error) {
          if (error)
            return callback(error);
          Openssl([
            "x509",
            "-days", "3600",
            "-req", "-in", __dirname+"/careq.pem",
            "-signkey", __dirname+"/cakey.pem",
            "-out", __dirname+"/cacert.pem"
          ], callback);
        });
      });
    });
  });
  ["certs", "keys", "reqs"].forEach(function (name) { clean(name, rdv) });
};
