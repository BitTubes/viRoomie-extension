/* jshint node:true, strict:false */

var self = require('sdk/self');

// a dummy function, to show how tests work.
// to see how to test this function, look at test/test-index.js
function dummy(text, callback) {
  callback(text);
}

exports.dummy = dummy;


var buttons = require('sdk/ui/button/action');
var tabs = require("sdk/tabs");
var panels = require("sdk/panel");

tabs.on('activate', function () {
  console.log('active: ' + tabs.activeTab.url);
  if(tabs.activeTab.url.indexOf("//www.youtube.com") > 0 || (tabs.activeTab.url.indexOf("//nlv.bittubes.com") > 0 && tabs.activeTab.url.indexOf("uid=")))
  var button = buttons.ActionButton({
    id: "mozilla-link",
    label: "Visit Mozilla",
    icon: {
      "16": "./img/icon16.png",
      "32": "./img/icon32.png",
      "64": "./img/icon64.png",
      "128": "./img/icon128.png",
      "256": "./img/icon256.png",
    },
    onClick: handleClick
  });
});
var button = buttons.ActionButton({
  id: "mozilla-link",
  label: "Visit Mozilla",
  icon: {
    "16": "./img/icon16.png",
    "32": "./img/icon32.png",
    "64": "./img/icon64.png",
    "128": "./img/icon128.png",
    "256": "./img/icon256.png",
  },
  onClick: handleClick
});

function handleHide() {
  button.state('window', {checked: false});
}
var panel = panels.Panel({
  contentURL: self.data.url("popup.html"),
  onHide: handleHide
});
function handleClick() {
  // tabs.open("http://www.mozilla.org/");
  panel.show({
    position: button
  });

function getRoomFromHash(url) {
  if(url.indexOf("#")>=0) {
    var hashvar,
      hashvars = tab.url.split("#")[1].split("&");
    for (var i = hashvars.length - 1; i >= 0; i--) {
      hashvar = hashvars[i].split("=");
      if(hashvar[0] == "room") {
        return hashvar[1];
      }
    }
  }
  return false;
}




var pageMod = require("sdk/page-mod");

pageMod.PageMod({
  include: "app.viroomie.com",
  contentScriptFile: ["./load_video_content_script.js"]
  // contentScript: 'document.body.innerHTML = ' +
  //                ' "<h1>Page matches ruleset</h1>";'
});