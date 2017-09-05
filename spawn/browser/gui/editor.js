
if (global.ace) {
  var prototype = {
    get: function () { return this._editor_.getValue() },
    set: function (value) { return this._editor_.setValue(value) },
    enable: function () { return this._editor_.setReadOnly(false) },
    disable: function () { return this._editor_.setReadOnly(true) }
  };
  module.exports = function (container) {
    var self = Object.create(prototype);
    self._editor_ = ace.edit(container);
    self._editor_.setTheme("ace/theme/chrome");
    self._editor_.getSession().setMode("ace/mode/javascript");
    self._editor_.$blockScrolling = Infinity;
    self._editor_.setOption("showPrintMargin", false);
    self._editor_.getSession().setTabSize(2);
    self._editor_.getSession().setUseSoftTabs(true);
    return self;
  };
} else {
  var prototype = {
    get: function () { return this._textarea_.value },
    set: function (value) { this._textarea_.value = value },
    enable: function () { this._textarea_.disabled = false },
    disable: function () { this._textarea_.disabled = true }
  };
  module.exports = function (container) {
    var self = Object.create(prototype);
    self._textarea_ = document.createElement("textarea");
    element.appendChild(self._textarea_);
    return self;
  };
}
