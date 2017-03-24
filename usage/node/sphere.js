var Pow = require("./pow.js");
if (process.argv.length !== 3)
  throw "Usage: node sphere.js <radius>"
var radius = process.argv[2];
var surface = 4 * Pow(Math.PI, 2) * radius;
var volume = 4/3 * Pow(Math.PI, 3) * radius;
process.stdout.write("surface is "+surface+"\n");
process.stdout.write("volume is "+volume+"\n");