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
  const ca = options.ca || Path.join(__dirname, "ca");
  try { Fs.mkdirSync(ca) } catch (error) {}
  ["cert", "key", "req"].forEach((dirname) => {
    try { Fs.mkdirSync(Path.join(ca, dirname)) } catch (error) {}
    Fs.readdirSync(Path.join(ca, dirname)).forEach((filename) => {
      Fs.unlinkSync(Path.join(ca, dirname, filename));
    });
  });
  Fs.writeFileSync(Path.join(ca, "serial.srl"), "01");
  openssl([
    "genrsa",
    "-out", Path.join(ca, "key.pem"),
    "2048"
  ]);
  openssl([
    "req",
    "-new",
    "-sha256",
    "-subj", "/CN=otiluke/O=Otiluke",
    "-key", Path.join(ca, "key.pem"),
    "-out", Path.join(ca, "req.pem")
  ]);
  openssl([
    "x509",
    "-days", "3600",
    "-req", "-in", Path.join(ca, "req.pem"),
    "-signkey", Path.join(ca, "key.pem"),
    "-out", Path.join(ca, "cert.pem")
  ]);
};
