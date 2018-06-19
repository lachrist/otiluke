#!/usr/bin/env node
const Path = require("path");
const Minimist = require("minimist");
const OtilukeNode = require("./index.js");
const options = Minimist(process.argv.slice(2));
const Virus = require(Path.resolve(options.virus));
const host = options.host;
const antena_options = {host:options.host, secure:options.secure};
const command = options._;
delete options._;
delete options.virus;
delete options.host;
delete options.secure;
OtilukeNode(Virus, command, antena_options, options);