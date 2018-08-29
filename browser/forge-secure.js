
const Http = require("http");

const cache = Object.create(null);

function onerror () {
  cache[this._otiluke_host] = true;
  this._otiluke_callback(null, true);
}

function onresponse () {
  cache[this._otiluke_host] = false;
  this._otiluke_callback(null, false);
}

module.exports = (hostname, port, callback) => {
  const host = hostname+":"+port;
  if (host in cache) {
    callback(null, cache[host]);
  } else {
    const request = Http.request({hostname, port, path:"/"});
    request._otiluke_host = host;
    request._otiluke_callback = callback;
    request.on("error", onerror);
    request.on("response", onresponse)
    request.end();
  }
};
