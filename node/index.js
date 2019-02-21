const Infect = require("./infect.js");
module.exports = (Virus, options) => {
  const command = options._;
  options = Object.assign({}, options);
  delete options._;
  Virus(options, (error, transform) => {
    if (error)
      throw error;
    Infect(transform, command);
  });
};