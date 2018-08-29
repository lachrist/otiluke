
module.exports = (request) => {
  const options = {
    method: request.method,
    headers: request.headers
  };
  let host;
  if (request.url[0] === "/" || request.url === "*") {
    host = request.headers.host;
    options.path = request.url;
  } else {
    let authority;
    if (request.method === "CONNECT") {
      authority = request.url;
    } else {
      const parts = /^([a-zA-Z][a-zA-Z+.-]+:)(.*)/.exec(request.url);
      if (parts) {
        options.protocol = parts[1];
        if (parts[2].startsWith("//")) {
          authority = parts[2].substring(2);
          const index = authority.search(/[/?#]/);
          if (index !== -1) {
            options.path = authority.substring(index);
            authority = authority.substring(0, index);
          }
        } else {
          options.path = parts[2];
          host = request.host;
        }
      }
    }
    if (authority) {
      const index = authority.indexOf("@");
      if (index === -1) {
        host = authority;
      } else {
        options.auth = authority.substring(0, index);
        host = authority.subtring(index+1);
      }
    }
  }
  if (host) {
    const index = host.indexOf(":");
    if (index === -1) {
      options.hostname = host;
      options.port = request.socket.encrypted ? 443 : 80;
    } else {
      options.hostname = host.substring(0, index);
      options.port = host.substring(index + 1);
    }
  }
  return options;
};
