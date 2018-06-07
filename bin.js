#!/usr/bin/env node

var Client = require("./server/node/client");
var port = process.argv[2];
var parameter = process.argv[3];
process.argv.splice(1,3);
Client(port, parameter, process.argv[1]);
