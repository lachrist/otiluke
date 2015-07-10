
var Entities = require("./entities.js");

///////////////
// Attribute //
///////////////

// cf: http://www.w3.org/TR/html-markup/syntax.html#attr-value-double-quoted //

function ondecmatch (match, dec) { return String.fromCharCode(dec) }
function onhexmatch (match, hex) { return String.fromCharCode("0"+hex) }
function onnamematch (match, name) { return String.fromCharCode(Entities[name]) }
exports.attribute2js = function (attribute) {
  return attribute
    .replace(/&#([0-9]+);/g, ondecmatch)
    .replace(/&#(x[0-9A-F]+);/ig, onhexmatch)
    .replace(/&([A-Z]+;?)/ig, onnamematch)
}

exports.js2attribute = function  (js) { return js.replace(/&/g, "&#38;").replace(/"/g, "&#34;"); }

////////////
// Script //
////////////

exports.script2js = function (script) { return script }

// See: http://www.w3.org/TR/html5/scripting-1.html, section 4.11.1.2 (green box)
exports.js2script = function (js) {
  return js
    .replace(/<!--/g, "<\\!--")
    .replace(/<script/g, "<\\script")
    .replace(/<\/script/g, "<\\/script")
}