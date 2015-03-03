

var FS = require("fs")
var HtmlParser = require("htmlparser2")
var Convert = require("./convert.js")

// http://www.w3schools.com/tags/ref_eventattributes.asp
// Such rudimentory predicate might be inaccurate, to be verified
function isjsattribute (name) { return name.indexOf("on") === 0 }
function testattribute (x) { return x || x==="" }

module.exports = function (readable, writable, before, runtime, otiluke, onjs) {
  runtime = runtime || "eval"
  otiluke = otiluke || "otiluke"
  onjs = onjs || function (code) { return ["window.", runtime, "(", JSON.stringify(code), ")"].join("") }
  FS.readFile(__dirname+"/template.js", {encoding:"utf8", flag:"r"}, function (err, template) {
    if (err) { throw err }
    var initializer = template.replace(/@OTILUKE/g, otiluke).replace(/@RUNTIME/g, runtime)
    if (!before) { return compile(readable, writable, initializer, runtime, otiluke, onjs) }
    FS.readFile(before, {encoding:"utf8", flag:"r"}, function (err, before) {
      if (err) { throw err }
      compile(readable, writable, before+initializer, runtime, otiluke, onjs)
    })
  })
}

function compile (readable, writable, initializer, runtime, otiluke, onjs) {
  var isjs = false
  var src = false
  readable.pipe(new HtmlParser.Parser({
    onopentag: function(tag, attributes) {
      if (tag === "script" && attributes.src) {
        src = attributes.src
        delete attributes.src
      }
      writable.write("<")
      writable.write(tag)
      for (var name in attributes) {
        writable.write(" ")
        writable.write(name)
        writable.write("=\"")
        writable.write(isjsattribute(name)
          ? Convert.js2attribute(onjs(Convert.attribute2js(attributes[name]), name))
          : attributes[name])
        writable.write("\"")
      }
      writable.write(">")
      if (tag === "script") {
        isjs = true
        if (src) {
          writable.write(otiluke)
          writable.write(".load(")
          writable.write(JSON.stringify(src))
          writable.write(",")
          writable.write(attributes.charset?JSON.stringify(attributes.charset):"null")
          writable.write(",")
          writable.write(testattribute(attributes.async)?"true":"false")
          writable.write(",")
          writable.write(testattribute(attributes.defer)?"true":"false")
          writable.write(")")
        }
      } else if (tag === "head") {
        writable.write("<script>")
        writable.write(initializer)
        writable.write("</script>")
      }
    },
    ontext: function(text) {
      if (isjs) { text = src ? "" : Convert.js2script(onjs(Convert.script2js(text), "script")) }
      writable.write(text)
    },
    onclosetag: function(tag) {
      if (tag === "script") {
        isjs = false
        src = false
      }
      if (tag === "body") {
        writable.write("<script>")
        writable.write(otiluke)
        writable.write(".after()")
        writable.write("</script>")
      }
      writable.write("</")
      writable.write(tag)
      writable.write(">")
    }
  }))
}
