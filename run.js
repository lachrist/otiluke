#!/usr/bin/env node

// usage: otiluke <in >out [before] [runtime] [otiluke] //

require("./main.js")(process.stdin, process.stdout, [process.argv[2]], process.argv[3], process.argv[4], null);
