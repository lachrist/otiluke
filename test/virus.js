module.exports = (argm) => {
  console.log("Initialize "+JSON.stringify(argm, null, 2));
  return (script, source) => [
    "console.log("+JSON.stringify("Begin: "+source)+");",
    script,
    "console.log("+JSON.stringify("End: "+source)+");"
  ].join("\n");
};