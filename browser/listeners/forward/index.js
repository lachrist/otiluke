
const Regular = require("./regular.js");
const Special = require("./special.js");

module.exports = (agents, infect, intercept, register) => ({
  request: Regular(agents, infect, intercept.request, register.request),
  connect: Special(intercept.connect, register.connect),
  upgrade: Special(intercept.upgrade, register.upgrade)
});
