
const Fs = require("fs");
const Path = require("path");
const ChildProcess = require("child_process");

const openssl = (argv) => {
  const result = ChildProcess.spawnSync("openssl", argv, {stdio:["ignore", "ignore", "pipe"]});
  if (result.error) {
    throw new Error(result.error);
  }
  if (result.status) {
    throw new Error("openssl "+argv.join(" ")+" failed with: "+result.status+"\n"+result.stderr);
  }
};

module.exports = (options) => {
  const cahome = options["ca-home"] || Path.join(__dirname, "ca-home");
  const subj = options["subj"] || "/CN=otiluke/O=Otiluke";
  try { Fs.mkdirSync(cahome) } catch (error) {}
  ["cert", "key", "req"].forEach((dirname) => {
    try { Fs.mkdirSync(Path.join(cahome, dirname)) } catch (error) {}
    Fs.readdirSync(Path.join(cahome, dirname)).forEach((filename) => {
      Fs.unlinkSync(Path.join(cahome, dirname, filename));
    });
  });
  Fs.writeFileSync(Path.join(cahome, "serial.srl"), "01");
  openssl([
    "genrsa",
    "-out", Path.join(cahome, "key.pem"),
    "2048"
  ]);
  openssl([
    "req",
    "-new",
    "-sha256",
    "-subj", subj,
    "-key", Path.join(cahome, "key.pem"),
    "-out", Path.join(cahome, "req.pem")
  ]);
  openssl([
    "x509",
    "-days", "3600",
    "-req", "-in", Path.join(cahome, "req.pem"),
    "-signkey", Path.join(cahome, "key.pem"),
    "-out", Path.join(cahome, "cert.pem")
  ]);
};
