var Main = require("../main.js");

function intercept (url) {
  console.log("Intercepting " + url);
  return function (js) {
    return "console.log('Executing ' + " + JSON.stringify(url) + ");\n" + js;
  }
}

Main({
  intercept: intercept,
  setup: __dirname + "/setup.js",
  port:8080
});

// Main({
//   intercept: intercept,
//   setup: __dirname + "/setup.js",
//   main: __dirname + "/node/main.js",
//   out: __dirname + "/node/bundle.js"
// });
