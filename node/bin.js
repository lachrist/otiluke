#!/usr/bin/env node
const Path = require("path");
const Minimist = require("minimist");
const OtilukeNode = require("./index.js");
const options = Minimist(process.argv.slice(2));
const Virus = require(Path.resolve(options.virus));
delete options.virus;
OtilukeNode(Virus, options);