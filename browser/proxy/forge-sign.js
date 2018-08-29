
const Fs = require("fs");
const Path = require("path");
const ChildProcess = require("child_process");

const openssl = (argv, callback) => {
  let error = "";
  var child = ChildProcess.spawn("openssl", argv, {stdio:["ignore", "ignore", "pipe"], encoding:"utf8"});
  child.stderr.on("data", (data) => { error += data });
  child.on("close", (code) => {
    callback(code && new Error("openssl "+argv.join(" ")+" failed with "+code+"\n"+error));
  });
};

module.exports = (hostname, cahome, callback) => {
  const done = () => {
    Fs.readFile(Path.join(cahome, "key", hostname+".pem"), (error, key) => {
      if (error)
        return callback(error);
      Fs.readFile(Path.join(cahome, "cert", hostname+".pem"), (error, cert) => {
        if (error)
          return callback(error);
        callback(null, {key:key, cert:cert});
      });
    });
  };
  Fs.readdir(Path.join(cahome, "key"), (error, filenames) => {
    if (error)
      return callback(error);
    if (filenames.includes(hostname+".pem"))
      return done();
    // openssl req -sha256 -nodes -newkey rsa:2048 -keyout key.pem -out csr.pem -subj "/CN=example.com"
    openssl([
      "req",
      "-sha256",
      "-nodes",
      "-newkey", "rsa:2048",
      "-keyout", Path.join(cahome, "key", hostname+".pem"),
      "-out", Path.join(cahome, "req", hostname+".pem"),
      "-subj", "/CN="+hostname
    ], (error) => {
      if (error)
        return callback(error);
      // openssl x509 -CA  -req -in csr.pem -signkey key.pem -out crt.pem
      openssl([
        "x509",
        "-CA", Path.join(cahome, "cert.pem"),
        "-CAkey", Path.join(cahome, "key.pem"),
        "-CAserial", Path.join(cahome, "serial.srl"),
        "-days", "3600",
        "-req", "-in", Path.join(cahome, "req", hostname+".pem"),
        "-out", Path.join(cahome, "cert", hostname+".pem")
      ], (error) => {
        if (error)
          return callback(error);
        done();
      });
    });
  });
};
