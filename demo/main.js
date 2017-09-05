
// var OTILUKE_CLIENT_MAIN
// var OTILUKE_RECEPTOR_REQUIRE
// var OTILUKE_VIRUS_REQUIRE

var OtilukeSpawnBrowser = require("../spawn/browser");
var OtilukeSpawnBrowserGuiSpawner = require("../spawn/browser/gui/spawner.js");
var OtilukeSpawnBrowserGuiEditorRequire = require("../spawn/browser/gui/editor-require.js");

window.onload = function () {
  var div1 = document.createElement("div");
  var div2 = document.createElement("div");
  var button1 = document.createElement("button");
  var button2 = document.createElement("button");
  var ol = document.createElement("ol");
  [div1, div2, button1, button2, ol].forEach(document.body.appendChild.bind(document.body));
  var reditor = OtilukeSpawnBrowserGuiEditorRequire(div1, OTILUKE_RECEPTOR_REQUIRE);
  var veditor = OtilukeSpawnBrowserGuiEditorRequire(div2, OTILUKE_VIRUS_REQUIRE);
  button2.innerText = "New";
  var spawn = null;
  var spawners = [];
  function toggle (test) {
    reditor[test ? "disable" : "enable"]();
    veditor[test ? "disable" : "enable"]();
    button.innerText = test ? "Stop" : "Start";
    button1.onclick = test ? "Stop" : "Start";
    button2.disabled = !test
  }
  button2.onclick = function () {
    var li = document.createElement("li");
    ol.appendChild(li);
    spawners.push(OtilukeSpawnBrowserGuiSpawner(li, spawn));
  };
  function start () {
    toggle(false);
    var spawn = OtilukeSpawnBrowser(global.eval(reditor.get()), URL.createObjectURL(new Blob([
      "var OTILUKE_VIRUS = "+veditor.get(),
      OTILUKE_CLIENT_MAIN
    ])));
  }
  function stop () {
    toggle(true);
    while (ol.firstChild)
      ol.removeChild(ol.firstChild);
    for (var i=0; i<spawners.length; i++)
      spawners[i].terminate();
    spawners = [];
    spawn = null;
  }
  toggle(true);
};
