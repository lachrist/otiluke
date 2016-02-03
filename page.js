
var Mitm = require("./mitm");

module.exports = function (setup, options) {
  setup = setup.toString("utf8");
  Mitm(options.port, function (url, type) {
    if (type.indexOf("javascript") !== -1)
      return options.intercept(url);
    if (type.indexOf("html") !== -1)
      return function (html) {
        return "<script>" + setup + "</script>"
          + html.replace(regexes.script, function (match, p1, p2, p3, offset) {
            if (regexes.external.test(p1))
              return match;
            var transform = options.intercept(url+"#"+offset);
            return transform ? p1 + transform(p2) + p3 : match;
          });
      };
  });
}

var regexes = {
  script: /(<script[^>]*>)([\s\S]*?)(<\/script>)/gi,
  external: /^<script[\s\S]*?src[\s]*?=[\s\S]*?>$/i
};
