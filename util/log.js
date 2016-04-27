exports.log = function (context) {
  return function (err) {
    process.stderr.write(context + " >> " + err.message + "\n");
  }
}