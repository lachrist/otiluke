const Infect = require("./infect.js");
module.exports = (Virus, options) => {
  const command = options._;
  options = Object.assign({}, options);
  delete options._;
  Infect(Virus(options), command);
};