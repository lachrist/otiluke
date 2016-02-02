var Fs = require("fs");
var ChildProcess = require("child_process");

Fs.writeFileSync(__dirname+"/index.txt", "");
["certs", "keys", "reqs"].forEach(function (dirname) {
  Fs.readdirSync(__dirname+"/"+dirname).forEach(function (filename) {
    Fs.unlinkSync(__dirname+"/"+dirname+"/"+filename);
  });
});
if (process.argv[2] === "--hard") {
  Fs.writeFileSync(__dirname+"/serial", "01");
  ChildProcess.spawnSync("openssl", [
    "genrsa",
    "-out", __dirname+"/cakey.pem",
    "2048"]);
  ChildProcess.spawnSync("openssl", [
    "req",
    "-new",
    "-sha256",
    "-key", __dirname+"/cakey.pem",
    "-out", __dirname+"/careq.pem"]);
  ChildProcess.spawnSync("openssl", [
    "x509",
    "-req",
    "-in", __dirname+"/careq.pem",
    "-signkey", __dirname+"/cakey.pem",
    "-out", __dirname+"/cacert.pem"]);
}