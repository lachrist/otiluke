module.exports = (argm) => {
  console.log("Initialize "+JSON.stringify(argm, null, 2));
  return (script, source) => [
    "console.log("+JSON.stringify("Evaluating: "+source)+");",
    script
  ].join("\n");
};