
(function (splitter) {

  if (splitter in this)
    return;

  var dummy = [];
  dummy.send = function (data) { dummy[dummy.length] = data };

  (new WebSocket("wss://"+location.host+"/"+splitter+"?"+encodeURIComponent(location.href))).onopen = function () {
    for (var i=0, l=dummy.length; i<l; i++)
      this.send(dummy[i]);
    dummy = this;
  }

  Object.defineProperty(this, splitter, {
    value: require(@TRANSPILE)({
      log: function (data) { dummy.send(data) }
    })
  });

} (@SPLITTER));
