/* jshint strict:false */



//  +++++++++++++++ GOOGLE ANALYTICS ++++++++++++

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-65099990-1']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();



//  +++++++++++++++ Screenshot ++++++++++++

// var screen_id = 100;
// function makeScreenshot() {
//   chrome.tabs.captureVisibleTab(function(screenshotUrl) {
//     var viewTabUrl = chrome.extension.getURL('screenshot.html?id=' + screen_id++);
//     // var targetId = null;
//     window.localStorage.setItem("screenshotUrl",screenshotUrl);

//     chrome.tabs.create({url: viewTabUrl});
//   });
// }



// //  +++++++++++++++ EMAIL INVITE ++++++++++++

// function sendMail() {
//   chrome.tabs.executeScript(null, {file: "email_content_script.js"});
// }



//  +++++++++++++++ OPEN VIDEO ++++++++++++

function openViRoomie(url) {
  chrome.tabs.create( {url: "http://app.viroomie.com#video="+(url.split("=").join("%3D").split("&").join("%26"))} );
}

function updateViroom(url, tabId, windowId) {
  // chrome.tabs.executeScript(tabId, {file: "load_video_content_script.js"});
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
function getRoomFromHash(url) {
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

function addElement(url, room, tabId, windowId) { 
  // create a new div element 
  // and give it some content 
  var newButton = document.createElement("button"); 
  var newContent = document.createTextNode(chrome.i18n.getMessage("open_in_existing", [room]));
  // newButton.setAttribute("data-room", room);
  newButton.setAttribute("id", "tabId"+tabId);
  newButton.onclick = updateViroom.bind(null,url, tabId, windowId);
  newButton.appendChild(newContent); //add the text node to the newly created div. 

  document.getElementById("updateapps").appendChild(newButton);
}
function findViRoomieTabs(url) {
  var buttonWrapper = document.getElementById('updateapps');
  buttonWrapper.setAttribute("data-msg", chrome.i18n.getMessage("searching_rooms"));

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
      room = getRoomFromHash(tab.url);
      if(room) {
        roomCounter++;
        addElement(url, room, tab.id, tab.windowId);
      }
    }
    // document.getElementById('msg').innerHTML = urls;
    if(roomCounter) {
      buttonWrapper.setAttribute("data-or", chrome.i18n.getMessage("or"));
    } else {
      buttonWrapper.style.display = "none";
    }
  });

}
// function updateViRoomie(url) {
//   chrome.tabs.sendMessage(integer tabId, any message, object options, function responseCallback);
// }



//  +++++++++++++++ UTIL ++++++++++++
var currentTabId = null;
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
    currentTabId = currentTab.id;
    // A tab is a plain object that provides information about the tab.
    // See https://developer.chrome.com/extensions/tabs#type-Tab
    var url = currentTab.url;

    // tab.url is only available if the "activeTab" permission is declared.
    // If you want to see the URL of other tabs (e.g. after removing active:true
    // from |queryInfo|), then the "tabs" permission is required to see their
    // "url" properties.
    console.assert(typeof url == 'string', 'tab.url should be a string');

    callback(url);
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


document.addEventListener('DOMContentLoaded', function() {
  // document.getElementById('options').onclick = function() {
  //   if (chrome.runtime.openOptionsPage) {
  //     // New way to open options pages, if supported (Chrome 42+).
  //     chrome.runtime.openOptionsPage();
  //   } else {
  //     // Reasonable fallback.
  //     window.open(chrome.runtime.getURL('options.html'));
  //   }
  // };
  getCurrentTabUrl(function(url) {
    processUrl(url, function() { // inside viRoomie

      // document.getElementById('msg').innerHTML = "app:"+url;
      // document.getElementById('app').style.display = "block";

      // document.getElementById('screenshot').onclick = makeScreenshot;
      // document.getElementById('email').onclick = sendMail;

    }, function(url) { // external website
      
      if(url.indexOf("youtube.com/watch")>0 || url.indexOf("//nlv.bittubes.com")>=0) {
        // openViRoomie(url);
        document.getElementById('openapp').innerHTML = chrome.i18n.getMessage("open_new");
        findViRoomieTabs(url);
      } else {
        document.getElementById('msg').innerHTML = chrome.i18n.getMessage("open_video_error");
        document.getElementById('updateapps').style.display = "none";
        document.getElementById('openapp').style.display = "none";
      }
      document.getElementById('external').style.display = "block";
      document.getElementById('openapp').onclick = openViRoomie.bind(null,url);
    });
  });
});