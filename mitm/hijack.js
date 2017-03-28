
var Querystring = require("querystring");

module.exports = function (Channel) {
  var onrequests = {};
  var queues = {};
  return {
    splitter: function () {
      var splitter = Crypto.randomBytes(64).toString("hex");
      queues[splitter] = [];
      splitters[splitter] = function () {
        queues[splitter].push(arguments);
      };
      return "otiluke"+splitter;
    },
    socket: function (ws) {
      var parts = /^\/otiluke([0-9a-f]+)\&(.)$/.exec(ws.upgradeReq.url);
      var onrequest = parts && onrequests[parts[1]];
      if (onrequest) {
        if (!queues[parts[1]])
          throw new Error("Double connection should never happen...");
        var query = Querystring.parse(parts[2]);
        var channel = Channel({
          sphere: query.sphere,
          target: query.target,
          send: function (data) { ws.send }
        });
        queues[parts[1]].forEach(function (xs) { channel.onrequest(xs[0], xs[1]) });
        delete queues[parts[1]];
        onrequests[parts[1]] = channel.onrequest;
        ws.on("message", channel.onmessage);
        ws.on("close", function (code, reason) {
          delete onrequests[parts[1]];
          channel.onclose(code, reason);
        });
      }
      return Boolean(onrequest);
    },
    request: function (req, res) {
      var parts = /^\/otiluke([0-9a-f]+)(\/.*)$/.exec(req.url);
      var onrequest = parts && onrequests[parts[1]];
      if (onrequest)
        onrequest(req, res);
      return Boolean(onrequest);
    };
  };
};
