
module.exports = function (script, source) {
  Otiluke.log("TRANSPILING "+source+"\n");
  return [
    "Otiluke.log('BEGIN '+"+JSON.stringify(source)+"+'\\n');",
    script,
    "Otiluke.log('END '+"+JSON.stringify(source)+"+'\\n');"
  ].join("\n");
};
