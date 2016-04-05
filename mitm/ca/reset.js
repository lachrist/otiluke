var Fs = require("fs");
var ChildProcess = require("child_process");

module.exports = function () {
  ["certs", "keys", "reqs"].forEach(function (dirname) {
    Fs.readdirSync(__dirname+"/"+dirname).forEach(function (filename) {
      Fs.unlinkSync(__dirname+"/"+dirname+"/"+filename);
    });
  });
  Fs.writeFileSync(__dirname+"/ca.srl", "01");
  ChildProcess.spawnSync("openssl", [
    "genrsa",
    "-out", __dirname+"/cakey.pem",
    "2048"]);
  ChildProcess.spawnSync("openssl", [
    "req",
    "-new",
    "-sha256",
    "-subj", "/CN=otiluke/O=Otiluke",
    "-key", __dirname+"/cakey.pem",
    "-out", __dirname+"/careq.pem"]);
  ChildProcess.spawnSync("openssl", [
    "x509",
    "-days", "3600",
    "-req", "-in", __dirname+"/careq.pem",
    "-signkey", __dirname+"/cakey.pem",
    "-out", __dirname+"/cacert.pem"]);
}

