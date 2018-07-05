#!/usr/bin/env node
const OtilukeBrowserCa = require("./index.js");
const Minimist = require("minimist");
const options = Minimist(process.argv.slice(2));
if ("initialize" in options) {
  OtilukeBrowserCa.initialize(options);
} else {
  console.log("usage: otiluke-browser-ca --initialize --home <path> --subj <arg>");
}