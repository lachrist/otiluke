#!/usr/bin/env node
const OtilukeBrowserReset = require("./reset.js");
const Minimist = require("minimist");
const options = Minimist(process.argv.slice(2));
if ("initialize" in options) {
  OtilukeBrowserReset(options);
} else {
  console.log("usage: otiluke-browser-ca --initialize --home <path> --subj <arg>");
}