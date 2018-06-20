
const Antena = require("antena/node");
const Infect = require("./infect.js");

module.exports = (Virus, options) => {
  const command = options._;
  const antena = "host" in options ? new Antena(options.host, options.secure) : null;
  options = Object.assign({}, options);
  delete options.host;
  delete options.secure;
  delete options._;
  Virus(antena, options, (error, infect) => {
    if (error)
      throw error;
    Infect(infect, command);
  });
};