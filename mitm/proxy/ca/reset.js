var Fs = require("fs");
var Spawn = require("../../../util/spawn.js");

module.exports = function () {
  ["certs", "keys", "reqs"].forEach(function (dirname) {
    Fs.readdirSync(__dirname+"/"+dirname).forEach(function (filename) {
      if (filename !== ".gitignore")
        Fs.unlinkSync(__dirname+"/"+dirname+"/"+filename);
    });
  });
  Fs.writeFileSync(__dirname+"/ca.srl", "01");
  Spawn.sync("openssl", [
    "genrsa",
    "-out", __dirname+"/cakey.pem",
    "2048"]) && process.exit(1);
  Spawn.sync("openssl", [
    "req",
    "-new",
    "-sha256",
    "-subj", "/CN=otiluke/O=Otiluke",
    "-key", __dirname+"/cakey.pem",
    "-out", __dirname+"/careq.pem"]) && process.exit(1);
  Spawn.sync("openssl", [
    "x509",
    "-days", "3600",
    "-req", "-in", __dirname+"/careq.pem",
    "-signkey", __dirname+"/cakey.pem",
    "-out", __dirname+"/cacert.pem"]) && process.exit(1);
};
