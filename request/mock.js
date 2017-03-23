function (method, path, headers, body, callback) {
    var result = JSON.parse(prompt("Reply to HTTP request as [status, headers, body]: "+JSON.stringify({
      method: method,
      path: path,
      headers: headers,
      body: body
    }, null, 4)), "[200, {}, \"\"]");
    if (callback)
      setTimeout(callback, 0, result[0], result[1], result[2]);
    else
      return result;
  };