#!/usr/bin/env node
const Minimist = require("minimist");
const Index = require("./index.js")
Index(Minimist(process.argv.slice(2)));