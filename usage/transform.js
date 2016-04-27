
module.exports = function (script, source) {
  console.log("TRANSFORMING "+source);
  return [
    "console.log('BEGIN '+"+JSON.stringify(source)+");",
    script,
    "console.log('END '+"+JSON.stringify(source)+");"
  ].join("\n");
};
