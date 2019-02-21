module.exports = (argm, callback) => {
  console.log("Initialize "+JSON.stringify(argm, null, 2));
  callback(null, (script, source) => [
    "console.log("+JSON.stringify("Evaluating: "+source)+");",
    script
  ].join("\n"));
};