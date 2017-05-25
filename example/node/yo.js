var Ws = require("ws");
var Http = require("http");
require("./pow.js");

var server = Http.createServer(function (req, res) {

});

(new Ws.Server({server:server})).on("connection", function (socket) {

});