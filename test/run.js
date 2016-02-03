var Main = require("../main.js");

// Main({
//   port:8080,
//   setup: [
//     "if (!window.____setup____) {",
//     "  window.____setup____ = true;",
//     "  alert('SWAGGY');",
//     "}",
//   ].join(""),
//   intercept: function (url) {
//     var counter = 0;
//     return function (js) {
//       console.log(url + " >> " + ++counter)
//       return js;
//     };
//   }
// });

Main({
  main: __dirname + "/node/main.js",
  out: __dirname + "/node/bundle.js",
  setup: __dirname + "/setup.js",
  intercept: function (url) {
    console.log(url);
    return function (js) { return js };
  }
});
