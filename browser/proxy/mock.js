
const Fs = require("fs");
const Path = require("path");
const Http = require("http");
const Https = require("https");
const ChildProcess = require("child_process");

const openssl = (argv, callback) => {
  let error = "";
  var child = ChildProcess.spawn("openssl", argv, {stdio:["ignore", "ignore", "pipe"], encoding:"utf8"});
  child.stderr.on("data", (data) => { error += data });
  child.on("close", (code) => {
    callback(code && new Error("openssl "+argv.join(" ")+" failed with "+code+"\n"+error));
  });
};

module.exports = (host, ca, callback) => {
  Http.request("http://"+host).on("response", () => {
    callback(null, Http.createServer());
  }).on("error", () => {
    const hostname = host.split(":")[0];
    const done = () => {
      Fs.readFile(Path.join(ca, "key", hostname+".pem"), (error, key) => {
        if (error)
          return callback(error);
        Fs.readFile(Path.join(ca, "cert", hostname+".pem"), (error, cert) => {
          if (error)
            return callback(error);
          callback(null, Https.createServer({key:key, cert:cert}));
        });
      });
    };
    Fs.readdir(Path.join(ca, "key"), (error, filenames) => {
      if (error)
        return callback(error);
      if (filenames.indexOf(hostname+".pem") !== -1)
        return done();
      // openssl req -sha256 -nodes -newkey rsa:2048 -keyout key.pem -out csr.pem -subj "/CN=example.com"
      openssl([
        "req",
        "-sha256",
        "-nodes",
        "-newkey", "rsa:2048",
        "-keyout", Path.join(ca, "key", hostname+".pem"),
        "-out", Path.join(ca, "req", hostname+".pem"),
        "-subj", "/CN="+hostname
      ], (error) => {
        if (error)
          return callback(error);
        // openssl x509 -CA  -req -in csr.pem -signkey key.pem -out crt.pem
        openssl([
          "x509",
          "-CA", Path.join(ca, "cert.pem"),
          "-CAkey", Path.join(ca, "key.pem"),
          "-CAserial", Path.join(ca, "serial.srl"),
          "-days", "3600",
          "-req", "-in", Path.join(ca, "req", hostname+".pem"),
          "-out", Path.join(ca, "cert", hostname+".pem")
        ], (error) => {
          if (error)
            return callback(error);
          done();
        });
      });
    });
  }).end();
};
