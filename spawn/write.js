
module.exports = function (x) {
  if (x === undefined)
    return {type:"undefined"};
  if (x instanceof Error)
    return {type:"error", stack:x.stack, name:x.name, message:x.message, code:x.code};
  return {inner:x};
};
