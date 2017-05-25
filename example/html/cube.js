
(function () {
  var edge = prompt("enter the cube's edge")
  var surface = 6 * POW(edge, 2);
  var volume = POW(edge, 3);
  alert("surface = "+surface+", volume = "+volume);
} ());
