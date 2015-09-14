/* jshint strict:false */

var _ = chrome.i18n.getMessage;
var p_updateapps;
var p_openapp;
var p_msg;
var p_external;

//  +++++++++++++++ GOOGLE ANALYTICS ++++++++++++

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-65099990-1']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();



// //  +++++++++++++++ EMAIL INVITE ++++++++++++

// function sendMail() {
//   chrome.tabs.executeScript(null, {file: "email_content_script.js"});
// }



//  +++++++++++++++ OPEN VIDEO ++++++++++++
function _addElement(url, room, tabId, windowId) { 
  // create a new div element 
  // and give it some content 
  var newButton = document.createElement("button"); 
  var newContent = document.createTextNode(_("open_in_existing", [room]));
  // newButton.setAttribute("data-room", room);
  newButton.setAttribute("id", "tabId"+tabId);
  newButton.onclick = updateViroom.bind(null,url, tabId, windowId);
  newButton.appendChild(newContent); //add the text node to the newly created div. 

  p_updateapps.appendChild(newButton);
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
      // break;
    }
  }
  return false;
}


var openViRoomie = function(url) {
  chrome.tabs.create( {url: "http://app.viroomie.com#video="+(url.split("=").join("%3D").split("&").join("%26"))} );
};
function updateViroom(url, tabId, windowId) {
  chrome.tabs.sendMessage(tabId, {"a":"url", "url":url}, function(data) {
    console.log("response from content-script: ",data);
    chrome.tabs.update(tabId, { // make tab active in its window
      active:true
    }, function() {
      if (chrome.runtime.lastError) {
          console.log(chrome.runtime.lastError.message);
          var button = document.getElementById("tabId"+tabId);
          button.parentNode.removeChild(button);
      } else {
        chrome.windows.update(windowId, { // make tab's window active
          drawAttention:true, // blink
          focused:true // bring window to front
        }, function() {});
        window.close();
      }
    });
  });
}

function findViRoomieTabs(url) {
  var buttonWrapper = p_updateapps;
  buttonWrapper.setAttribute("data-msg", _("searching_rooms"));

  var queryInfo = {
    status: "complete",
    url: "http://app.viroomie.com/*"
  };
  var room,
    roomCounter = 0,
    tab;
  chrome.tabs.query(queryInfo, function(tabs) {
    buttonWrapper.removeAttribute("data-msg");
    urls = "";
    for(var el in tabs) {
      tab = tabs[el];
      room = _getRoomFromHash(tab.url);
      if(room) {
        roomCounter++;
        _addElement(url, room, tab.id, tab.windowId);
      }
    }
    if(roomCounter) {
      buttonWrapper.setAttribute("data-or", _("or"));
    } else {
      buttonWrapper.style.display = "none";
    }
  });

}



//  +++++++++++++++ UTIL ++++++++++++
// var _currentTabId = null;
function getCurrentTabUrl(callback) {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    // chrome.tabs.query invokes the callback with a list of tabs that match the
    // query. When the popup is opened, there is certainly a window and at least
    // one tab, so we can safely assume that |tabs| is a non-empty array.
    // A window can only have one active tab at a time, so the array consists of
    // exactly one tab.
    var currentTab = tabs[0];
    // _currentTabId = currentTab.id;
    // A tab is a plain object that provides information about the tab.
    // See https://developer.chrome.com/extensions/tabs#type-Tab
    var url = currentTab.url;

    // tab.url is only available if the "activeTab" permission is declared.
    // If you want to see the URL of other tabs (e.g. after removing active:true
    // from |queryInfo|), then the "tabs" permission is required to see their
    // "url" properties.
    console.assert(typeof url == 'string', 'tab.url should be a string');

    callback(url, currentTab.id);
  });
  // chrome.tabs.getCurrent(function(currentTab){
  //   callback(currentTab.url);
  // });
  // Most methods of the Chrome extension APIs are asynchronous!
}
function processUrl(url, viroomieCallback, externalCallback) {
  if(url.indexOf("//app.viroomie.com")>0) {
    viroomieCallback(url);
  } else {
    externalCallback(url);
  }
}
var embeddableYtCallback;
var port = chrome.extension.connect({name: "Sample Communication"});
// port.postMessage("Hi BackGround");
port.onMessage.addListener(function(data) {
  switch(data.a) {
    case "embeddableYt":
      embeddableYtCallback(data.id, data.val);
      break;
  }
});


function checkEmbedStatus(url, callback) {
  var ytID = _getYouTubeId(url);
  // console.log(embeddableYt[ytID]);
  embeddableYtCallback = function(embeddableYt_ID, embeddableYt_Val) {
    if(embeddableYt_ID!=ytID) {
      return;
    }
    if("undefined" != typeof embeddableYt_Val) {
      callback(embeddableYt_Val);
      return;
    }
    var ApiKey = 'AIzaSyDVaU9_EkkYi7OZLCb2XANCLLO7zGfDjpA'; // API key for chrome extension; if you re-use this code, please change
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState == XMLHttpRequest.DONE ) {
        if(xhr.status == 200){
          var data = JSON.parse(xhr.responseText);
          try {
            data = data["items"][0]["status"]["embeddable"];
          } catch(e) {
            data = false;
          }
          embeddableYt_Val = data;
          callback(data);
        }
        else { // fallback - something went wrong with that api call hence we assume embeddable to be true
          embeddableYt_Val = true;
          callback(true);
        }
      }
    };

    xhr.open("GET", 'https://www.googleapis.com/youtube/v3/videos?part=status&id='+ytID+'&maxResults=1&fields=items(status%2Fembeddable)&key='+ApiKey, true);
    xhr.send();
  };
  port.postMessage({
    "a": "getEmbeddableYt",
    "id": ytID
  });

}
function initExternalPlayer(data) {
  console.log("response from content-script: ",data);
  if(data && data.a=="nf200") {
    p_msg.innerHTML = _("already_loaded");
    p_external.style.display = "block";
    p_updateapps.style.display = "none";
    p_openapp.style.display = "none";
  } else {
    showExternalPlayer(data.tabId, data.url);
  }
}
function showExternalPlayer(tabId, url) {
  openViRoomie = function(){
    console.error("openViRoomie", tabId, url);
    var room = this.getAttribute("data-room") || "";
    chrome.tabs.sendMessage(tabId, {"a":"init", "room": room}, function(data) {
      console.log("response from content-script: ",data);
      if(data=="started") {
        window.close();
      }
    });
  };
  chrome.tabs.sendMessage(tabId, {"a":"load"}, function() {});

  p_openapp.innerHTML = _("open_new");
  p_openapp.setAttribute("data-room","");
  var room = _getRoomFromHash(url);
  if(room) {
    var newButton = document.createElement("button"); 
    var newContent = document.createTextNode(_("open_in_existing", [room]));
    newButton.setAttribute("data-room", room);
    newButton.onclick = openViRoomie.bind(newButton);
    newButton.appendChild(newContent); //add the text node to the newly created div. 

    p_updateapps.appendChild(newButton);
  } else {
    p_updateapps.style.display = "none";
  }
  p_external.style.display = "block";
  p_openapp.onclick = openViRoomie.bind(p_openapp,url);
}

document.addEventListener('DOMContentLoaded', function() {
  p_updateapps = document.getElementById('updateapps');
  p_openapp = document.getElementById('openapp');
  p_msg = document.getElementById('msg');
  p_external = document.getElementById('external');
  // document.getElementById('options').onclick = function() {
  //   if (chrome.runtime.openOptionsPage) {
  //     // New way to open options pages, if supported (Chrome 42+).
  //     chrome.runtime.openOptionsPage();
  //   } else {
  //     // Reasonable fallback.
  //     window.open(chrome.runtime.getURL('options.html'));
  //   }
  // };
  function showButtons(url, hideTabs) {
    p_openapp.innerHTML = _("open_new");
    if(!hideTabs) {
      findViRoomieTabs(url);
    } else {
      p_updateapps.style.display = "none";
    }
  }
  var externalUrls = [
    "netflix.com/watch",
    "maxdome.de/webplayer",

    "www.ardmediathek.de",
    "mediathek.daserste.de",
    "mediathek.rbb-online.de",
    "sr-mediathek.sr-online.de",
    "hessenschau.de",
    "www.zdf.de"
  ];
  function isExternalUrl(url) {
    for (var i = externalUrls.length - 1; i >= 0; i--) {
      if(url.indexOf(externalUrls[i])>0) {
        return true;
      }
    }
    return false;
  }
  getCurrentTabUrl(function(url, tabId) {
    processUrl(url, function() { // inside viRoomie

      // p_msg.innerHTML = "app:"+url;
      // document.getElementById('app').style.display = "block";

      // document.getElementById('screenshot').onclick = makeScreenshot;
      // document.getElementById('email').onclick = sendMail;

    }, function(url) { // external website
      
      if(url.indexOf("youtube.com/watch")>0) {
        checkEmbedStatus(url,function(embeddable) {
          if(embeddable) {
            showButtons(url);
          } else {
            p_msg.innerHTML = _("embed_video_error");
            p_updateapps.style.display = "none";
            p_openapp.style.display = "none";
          }
        });
      } else if(isExternalUrl(url)) {
        console.log("isExternal");
        chrome.tabs.sendMessage(tabId, {"a":"running", "tabId":tabId, "url":url}, function(data){
          initExternalPlayer(data);
        });
        return;
        // chrome.tabs.sendMessage(tabId, {"a":"running"});
      } else if(url.indexOf("//nlv.bittubes.com")>=0) {
        showButtons(url);
      } else {
        p_msg.innerHTML = _("open_video_error");
        p_updateapps.style.display = "none";
        p_openapp.style.display = "none";
      }
      p_external.style.display = "block";
      p_openapp.onclick = openViRoomie.bind(p_openapp,url);
    });
  });
});