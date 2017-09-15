
var Fs = require("fs");
var Common = require("./common.js");
var Performance = require("../util/performance.js");

module.exports = Common(Performance, function (source, callback) { Fs.readFile(source, "utf8", callback) });
