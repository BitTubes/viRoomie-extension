/* jshint strict:false */



//  +++++++++++++++ GOOGLE ANALYTICS ++++++++++++

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-65099990-5']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();




var self = require('sdk/self');
var _ = require("sdk/l10n").get;


var tbuttons = require('sdk/ui/button/toggle');
var tabs = require("sdk/tabs");
var panels = require("sdk/panel");
var pageMod = require("sdk/page-mod");
var xhr = require("sdk/request").Request;

var embeddableYt = {};
var tabWorker = {};
var roomTabIds = {};
var roomCount = 0;
var button;
var panel;

var panel_h = {
  "button": 29,
  "bodymargin": 16+10+5,
  "updateapps": 30
};
var panel_w = 220;//216;




function _updatePanelHeight() {
  var height = panel_h["bodymargin"] + panel_h["button"];
  if(roomCount) {
    height += roomCount*panel_h["button"] + panel_h["updateapps"];
  }
  panel.resize(panel_w, height);
}
function _handlePanelHide() {
  if(button) { // hide only makes sense if it wasnt triggered by hiding the button
    button.state('window', {checked: false});
  }
}
function _onCloseRoom(tab) {
  console.log("close", tab.id);
  panel.port.emit("hide", tab.id);
  delete roomTabIds[tab.id];
  roomCount--;
  _updatePanelHeight();
}
function _getRoomFromHash(url) {
  if(url.indexOf("#")>=0) {
    var hashvar,
      hashvars = url.split("#")[1].split("&");
    for (var i = hashvars.length - 1; i >= 0; i--) {
      hashvar = hashvars[i].split("=");
      if(hashvar[0] == "room") {
        return hashvar[1];
      }
    }
  }
  return false;
}
function _getYouTubeId(url) {
  var uriFormats = ["/embed/","watch?v=","youtu.be/","youtube.com/v/"];
  for (var i = 0; i < uriFormats.length; i++) {
    if(url.indexOf(uriFormats[i])!=-1) {
      return (url.split(uriFormats[i]))[1].substr(0,11);
    }
  }
  return false;
}

function checkEmbedStatus(url, callback) {
  var ytID = _getYouTubeId(url);
  if("undefined" != typeof embeddableYt[ytID]) {
    callback(embeddableYt[ytID]);
    return;
  }
  var ApiKey = 'AIzaSyDYrL9myfxlbrqXm7U6dbbjNlFwjNTD19A'; // API key for firefox extension; if you re-use this code, please change
  xhr({
    url: 'https://www.googleapis.com/youtube/v3/videos?part=status&id='+ytID+'&maxResults=1&fields=items(status%2Fembeddable)&key='+ApiKey,
    onComplete:  function(response) {
      if(response.status == 200){
        var data = response.json;
        try {
          data = data["items"][0]["status"]["embeddable"];
        } catch(e) {
          data = false;
        }
        embeddableYt[ytID] = data;
        callback(data);
      }
      else { // fallback - something went wrong with that api call hence we assume embeddable to be true
        embeddableYt[ytID] = true;
        callback(true);
      }
    }
  }).get();
}

function showTabs() {
  var myTabs = [],
    tab,
    room;
  roomCount = 0;
  for (var i = tabs.length - 1; i >= 0; i--) {
    tab = tabs[i];
    room = _getRoomFromHash(tab.url);
    if(room) {
      roomCount++;
      myTabs.push({"id": tab.id, "room": room});
    }
  }
  panel.port.emit("show", myTabs);
}
function _handleToggleClick(state) {
  console.log("_handleToggleClick",state);
  if (state.checked) {
    var url = tabs.activeTab.url.split("#")[0];
    if(url.indexOf("youtube.com/watch")>0) {
      checkEmbedStatus(url, function(embeddable) {
        if(embeddable) {
          showTabs();
        } else {
          roomCount=1;
          panel.port.emit("error", "embed_video_error");
        }

        _updatePanelHeight();
        panel.show({
          position: button
        });
      });
    } else {
      if(url.indexOf("//nlv.bittubes.com")>=0) {
        showTabs();
      } else {
        roomCount=0;
        panel.port.emit("error","open_video_error");
      }
      _updatePanelHeight();
      panel.show({
        position: button
      });
    }
  }
}



function toggleButton(url) {
  url = url.split("#")[0];
  if(url.indexOf("youtube.com") > 0 
    || url.indexOf("localhost") >= 0 
    || (
      url.indexOf("nlv.bittubes.com") > 0 && url.indexOf("uid=") > 0
      )
    ) { 
    console.log("youtube or bt localhost activated");
    if(!button) {
      button = tbuttons.ToggleButton({
        id: "viroomie",
        label: _("application_title"),
        icon: {
          "16": "./img/icon16.png",
          "32": "./img/icon32.png",
          "64": "./img/icon64.png",
          "128": "./img/icon128.png",
          "256": "./img/icon256.png",
        },
        onClick: _handleToggleClick
      });
    }
  } else {
    console.log("other tab activated");
    if(button) {
      panel.hide();
      button.destroy();
      button = null;
    }
  }
}
function openViRoomie(url) {
  tabs.open("http://app.viroomie.com#video="+(url.split("=").join("%3D").split("&").join("%26")));
}
function findTabById(tabId) {
  for (var i = tabs.length - 1; i >= 0; i--) {
    if(tabs[i].id == tabId) {
      return tabs[i];
    }
  }
  return false;
}
function updateViroom(url, tabId) {
  var tab = findTabById(tabId);
  if(!tab) {
    return;
  }
  tabWorker[tabId].port.emit("viroomie", {"a":"url", "url":url});
  tabWorker[tabId].port.on("cb_url", function(data) {
    console.log("response from content-script: ",data);
    tab.activate();
    tab.window.activate();
  });
}



panel = panels.Panel({
  contentURL: self.data.url("popup.html"),
  height: panel_w,
  width: panel_h["bodymargin"] + panel_h["button"],
  onHide: _handlePanelHide
});
panel.port.on("loaded", function(){
  console.log("loaded");
  // send translations to panel, because it cannot get them itself... COME ON Mozilla - you can do better!
  panel.port.emit("locale", {
    "open_new": _("open_new"),
    "open_in_existing": _("open_in_existing", "$1"),
    "or": _("or"),
    "loading": _("loading"),
    "open_video_error": _("open_video_error"),
    "embed_video_error": _("embed_video_error")
  });
});
panel.port.on("clicked", function(tabId){
  console.log("clicked", tabId);
  if(tabId=="openapp") {
    openViRoomie(tabs.activeTab.url);
  } else {
    tabId = tabId.substr(5);
    console.log("update tabId:", tabId);
    updateViroom(tabs.activeTab.url, tabId);
  }
});


tabs.on('pageshow', function(tab) {
  console.log("pageshow:",tab.url);
  var room = _getRoomFromHash(tab.url);
  if(room && !roomTabIds[tab.id]) {
    console.log("pageshow room opened",tab);
    panel.port.emit("show1", {"id": tab.id, "room": room});
    tab.on("close",_onCloseRoom);
    roomTabIds[tab.id] = room;
    roomCount++;
    _updatePanelHeight();
  } else if(roomTabIds[tab.id] && !room) {
    console.log("pageshow room closed",tab);
    _onCloseRoom(tab);
  } else if(room && roomTabIds[tab.id] && room != roomTabIds[tab.id]){
    console.log("pageshow room changed",tab, room);
    panel.port.emit("hide", tab.id); // this will produce false positives
    panel.port.emit("show1", {"id": tab.id, "room": room});
    roomTabIds[tab.id] = room;
  } else {
    console.log("pageshow no change necessary",tab);
  }
  if(tabs.activeTab == tab) {
    toggleButton(tab.url);
  }
});
tabs.on('activate', function (tab) {
  console.log('active: ', tabs.activeTab.url, "==", tab.url);
  toggleButton(tab.url);
});


pageMod.PageMod({
  include: "*.viroomie.com",
  contentScriptFile: ["./load_video_content_script.js"],
  attachTo: ["existing", "top"],
  onAttach: function(worker) {
    console.log("attach worker", worker);
    tabWorker[worker.tab.id] = worker;
    worker.on('detach', function () {
      console.log("DEtach worker", worker);
      delete tabWorker[worker.tab.id];
    });
  }
});
