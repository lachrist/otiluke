
module.exports = function (value) {
  value = print(0, value);
  return (value.length < 100) ? value : value.substring(0,100) + "...";
};

function print (depth, value) {
  if (value === undefined)
    return "undefined";
  if (value === null)
    return "null";
  if (typeof value === "string")
    return JSON.stringify(value);
  if (typeof value === "function")
    return "[function " + value.name + "]";
  if (Array.isArray(value)) {
    if (depth > 2)
      return "[array]";
    return "[" + value.map(print.bind(null, depth+1)).join(", ") + "]";
  }
  if (value instanceof Error)
    return String(value);
  if (typeof value === "object") {
    if (depth > 2)
      return "[object]"
    return "{" + Object.keys(value).map(function (k) { k+":"+print(depth+1, value[k]) }).join(", ") + "}"
  }
  return String(value);
}
