
function nil () {}
var levels = {error:1, warning:2, info:3}

module.exports = function (log) {
  level = levels[log] || 0;
  return {
    error:   (level >= 1) ? function (s) { process.stderr.write("ERROR: "+s) }   : nil,
    warning: (level >= 2) ? function (s) { process.stdout.write("Warning: "+s) } : nil,
    info:    (level >= 3) ? function (s) { process.stdout.write("info: "+s) }    : nil
  };
}
