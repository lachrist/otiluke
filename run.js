#!/usr/bin/env node

// usage: otiluke [runtime] [otiluke] [before] <in >out //

require("./main.js")(process.stdin, process.stdout, process.argv[2], process.argv[3], process.argv[4], null)
