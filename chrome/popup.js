/* jshint strict:false */

var screen_id = 100;


function makeScreenshot() {
  chrome.tabs.captureVisibleTab(function(screenshotUrl) {
    var viewTabUrl = chrome.extension.getURL('screenshot.html?id=' + screen_id++);
    // var targetId = null;
    window.localStorage.setItem("screenshotUrl",screenshotUrl);

    chrome.tabs.create({url: viewTabUrl});
  });
}


function sendMail() {
  chrome.tabs.executeScript(null, {file: "mail_content_script.js"});
}

function openViRoomie(url) {
  chrome.tabs.create( {url: "http://app.viroomie.com#video="+(url.split("=").join("%3D").split("&").join("%26"))} );
}


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
    processUrl(url, function(url) { // inside viRoomie
      // document.getElementById('msg').innerHTML = "app:"+url;
      document.getElementById('app').style.display = "block";

      document.getElementById('screenshot').onclick = makeScreenshot;
      document.getElementById('email').onclick = sendMail;

    }, function(url) { // external website
      

      openViRoomie(url);


      // document.getElementById('msg').innerHTML = "external:"+url;
      document.getElementById('external').style.display = "block";

      document.getElementById('openapp').onclick = openViRoomie.bind(null,url);
    });
  });
});