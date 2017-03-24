var Pow = require("./pow.js");
if (process.argv.length !== 3)
  throw "Usage: node sphere.js <radius>"
var radius = process.argv[2];
var circonference = 2 * Pow(Math.PI, 1) * radius;
var surface = 1 * Pow(Math.PI, 2) * radius;
process.stdout.write("circonference is "+circonference+"\n");
process.stdout.write("surface is "+surface+"\n");