var Pow = require("./pow.js");
if (process.argv.length !== 3)
  throw "Usage: node cube.js <edge>"
var edge = process.argv[2];
var surface = 6 * Pow(edge, 2);
var volume = Pow(edge, 3);
process.stdout.write("surface is "+surface+"\n");
process.stdout.write("volume is "+volume+"\n");