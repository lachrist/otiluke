#!/usr/bin/env node

// usage: otiluke [runtime] [otiluke] <in >out

require("./main.js")(process.stdin, process.stdout, null, process.argv[2], process.argv[3])
