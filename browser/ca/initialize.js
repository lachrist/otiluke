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
  const home = options.home || Path.join(__dirname, "..", "ca-home");
  try { Fs.mkdirSync(home) } catch (error) {}
  ["cert", "key", "req"].forEach((dirname) => {
    try { Fs.mkdirSync(Path.join(home, dirname)) } catch (error) {}
    Fs.readdirSync(Path.join(home, dirname)).forEach((filename) => {
      Fs.unlinkSync(Path.join(home, dirname, filename));
    });
  });
  Fs.writeFileSync(Path.join(home, "serial.srl"), "01");
  openssl([
    "genrsa",
    "-out", Path.join(home, "key.pem"),
    "2048"
  ]);
  openssl([
    "req",
    "-new",
    "-sha256",
    "-subj", options.subj || "/CN=otiluke/O=Otiluke",
    "-key", Path.join(home, "key.pem"),
    "-out", Path.join(home, "req.pem")
  ]);
  openssl([
    "x509",
    "-days", "3600",
    "-req", "-in", Path.join(home, "req.pem"),
    "-signkey", Path.join(home, "key.pem"),
    "-out", Path.join(home, "cert.pem")
  ]);
};
