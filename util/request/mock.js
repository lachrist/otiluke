module.exports = function (method, path, headers, body, callback) {
  var info = JSON.stringify({
    method: method,
    path: path,
    headers: headers,
    body: body
  }, null, 4);
  return callback
    ? alert("Asynchronous HTTP request: "+info)
    : JSON.parse(prompt("Reply to synchronous HTTP request as [status, headers, body]: "+info, "[200, {}, \"\"]");
};