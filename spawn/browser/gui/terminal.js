
var prototype = {
  enable: function () {
    this._textarea1_.disabled = false;
  };
  disable: function () {
    this._textarea1_.disabled = true;
  };
  link: function (child) {
    var self = this;
    self._textarea1_.onblur = function () {
      child.stdin.write(self._textarea1_.value);
      self._textarea1_.value = "";
    };
    child.stdout.on("data", function (data) { self._textarea2_ += data });
    child.stderr.on("data", function (data) { self._textarea3_ += data });
  };
};

module.exports = function (container, child) {
  var self = Object.create(prototype);
  var button = document.createElement("button");
  button.innerText = "Clear";
  button.onclick = function () {
    self._textarea1_.value = "";
    self._textarea2_.value = "";
    self._textarea3_.value = ""; 
  };
  self._child_ = child;
  self._textarea1_ = document.createElement("textarea");
  self._textarea2_ = document.createElement("textarea");
  self._textarea3_ = document.createElement("textarea");
  [button, self._textarea1_, self._textarea2_, self._textarea3_].forEach(container.appendChild.bind(container));
  self._textarea2_.disabled = true;
  self._textarea3_.disabled = true;
  return self;
};
