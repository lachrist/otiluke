
module.exports = function (code, url) {
  console.log("TRANSFORMING "+url);
  return [
    "console.log('BEGIN '+"+JSON.stringify(url)+");",
    code,
    "console.log('END '+"+JSON.stringify(url)+")"
  ].join("\n");
}
