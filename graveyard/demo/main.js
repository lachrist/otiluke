
// var OTILUKE_CLIENT_MAIN
// var OTILUKE_RECEPTOR_REQUIRE
// var OTILUKE_VIRUS_REQUIRE

var OtilukeSpawnBrowser = require("../spawn/browser");
var OtilukeSpawnBrowserGuiSpawner = require("../spawn/browser/gui/spawner.js");
var OtilukeSpawnBrowserGuiEditorRequire = require("../spawn/browser/gui/editor-dependency.js");

window.onload = function () {
  var div1 = document.createElement("div");
  var div2 = document.createElement("div");
  var button1 = document.createElement("button");
  var button2 = document.createElement("button");
  var ol = document.createElement("ol");
  [div1, div2, button1, button2, ol].forEach(document.body.appendChild.bind(document.body));
  var reditor = OtilukeSpawnBrowserGuiEditorRequire(div1, OTILUKE_RECEPTOR_DEPENDENCY);
  var veditor = OtilukeSpawnBrowserGuiEditorRequire(div2, OTILUKE_VIRUS_DEPENDENCY);
  button2.innerText = "New";
  var spawn = null;
  var spawners = [];
  function toggle (test) {
    reditor[test ? "disable" : "enable"]();
    veditor[test ? "disable" : "enable"]();
    button1.innerText = test ? "Stop" : "Start";
    button1.onclick = test ? stop : start;
    button2.disabled = !test
  }
  button2.onclick = function () {
    var li = document.createElement("li");
    ol.appendChild(li);
    spawners.push(OtilukeSpawnBrowserGuiSpawner(li, spawn, OTILUKE_CLIENT_DEPENDENCY));
  };
  function start () {
    toggle(true);
    spawn = OtilukeSpawnBrowser(global.eval(reditor.get()), URL.createObjectURL(new Blob([
      "var OTILUKE_VIRUS = "+veditor.get()+";\n",
      OTILUKE_CLIENT_BUNDLE
    ], {type: "application/javascript"})));
  }
  function stop () {
    toggle(false);
    while (ol.firstChild)
      ol.removeChild(ol.firstChild);
    for (var i=0; i<spawners.length; i++)
      spawners[i].terminate();
    spawners = [];
    spawn = null;
  }
  toggle(false);
};
