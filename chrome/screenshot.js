/* jshint strict:false */

document.addEventListener('DOMContentLoaded', function() {
  var url = window.localStorage.getItem("screenshotUrl");
  document.getElementById('screenshot').src = url;
});
