
function nil () {}
var levels = {error:1, warning:2, info:3}

module.exports = function (log) {
  level = levels[log] || 0;
  return {
    error:   (level >= 1) ? function () { write(process.stderr, "ERROR: ",   arguments) } : nil,
    warning: (level >= 2) ? function () { write(process.stdout, "Warning: ", arguments) } : nil,
    info:    (level >= 3) ? function () { write(process.stdout, "info: ",    arguments) } : nil
  };
}

function write(wst, prefix, args) {
  wst.write(prefix);
  for (var i=0; i<args.length; i++) {
    if (typeof args[i] === "object")
      try { wst.write(JSON.stringify(args[i])) }
      catch (e) { wst.write(String(args[i])) }
    else
      wst.write(String(args[i]));
  }
}
