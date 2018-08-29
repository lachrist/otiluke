
const ForwardRegular = require("./forward-regular.js");
const ForwardSpecial = require("./forward-special.js");

module.exports = (handlers, infect) => ({
  request: ForwardRegular(infect, handlers),
  connect: ForwardSpecial("connect", handlers),
  upgrade: ForwardSpecial("upgrade", handlers)
});
