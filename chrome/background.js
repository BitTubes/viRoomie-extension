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




chrome.runtime.onConnect.addListener(function(port) {
  var tab = port.sender.tab;

  // This will get called by the content script we execute in
  // the tab as a result of the user pressing the browser action.
  port.onMessage.addListener(function(info) {
    var max_length = 1024;
    if (info.selection.length > max_length){
      info.selection = info.selection.substring(0, max_length);
    }
    executeMailto(tab.id, info.title, tab.url, info.selection);
  });
});

var manifestData = chrome.runtime.getManifest();
// console.log(manifestData);
chrome.runtime.onMessageExternal.addListener( function(request, sender, sendResponse) {
  // console.info("test");
  if (request && request.message == "version") {
    sendResponse({version: manifestData.version});
  }
  return true;
});


var path19 = "img/icon19_share.png";
// var path38 = "img/icon19_share.png";

// wrapper because setting the icon directly is currently not possible... bugreport pending
function createSetIconAction(callback) {
  var canvas = document.createElement("canvas");
  var ctx = canvas.getContext("2d");
  var image = new Image();
  image.onload = function() {
    ctx.drawImage(image,0,0,19,19);
    var imageData = ctx.getImageData(0,0,19,19);
    var action = new chrome.declarativeContent.SetIcon({imageData: imageData});
    callback(action);
  };
  image.src = chrome.runtime.getURL(path19);
}
// function createSetIconAction(callback) {
//   var canvas = document.createElement("canvas");
//   var ctx = canvas.getContext("2d");
//   var image19 = new Image();
//   image19.onload = function() {
//     ctx.drawImage(image,0,0,19,19);
//     var imageData19 = ctx.getImageData(0,0,19,19);
//     var image38 = new Image();
//     image38.onload = function() {
//       ctx.drawImage(image,0,0,38,38);
//       var imageData38 = ctx.getImageData(0,0,38,38);      
//       var action = new chrome.declarativeContent.SetIcon({"imageData":{
//         "19": imageData19,
//         "38": imageData38
//       }});
//       callback(action);
//     };
//     image38.src = chrome.runtime.getURL(path38);
//   };
//   image19.src = chrome.runtime.getURL(path19);
// }

// function setPageActionTitle() {
//   chrome.tabs.query(queryInfo, function(tabs) {
//     var currentTab = tabs[0];
//     chrome.pageAction.setTitle({
//       tabId: currentTab.id,
//       title: chrome.i18n.getMessage("application_title")
//     });
//   });
// }
var embeddableYt = {};
chrome.extension.onConnect.addListener(function(port) {
  console.log("Connected .....");
  port.onMessage.addListener(function(data) {
    switch(data.a) {
      case "getEmbeddableYt":
        port.postMessage({
          "a":"embeddableYt",
          "id": data.id,
          "val":embeddableYt[data.id]
        });
        break;
      case "setEmbeddableYt":
        embeddableYt[data.id] = data.val;
        break;
    }
  });
});

// When the extension is installed or upgraded ...
chrome.runtime.onInstalled.addListener(function() {
  // Replace all rules ...
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    // With a new rule ...
    createSetIconAction(function(setIconAction) {
      chrome.declarativeContent.onPageChanged.addRules([
        // {
        //   conditions: [
        //     // That fires when a page's URL contains a 'chrome' ...
        //     new chrome.declarativeContent.PageStateMatcher({
        //       pageUrl: { urlContains: 'chrome.com' },
        //     // }),
        //     // // When a page contains a <video> tag...
        //     // new chrome.declarativeContent.PageStateMatcher({
        //     //   css: ["video"]
        //     })
        //   ],
        //   // And shows the extension's page action.
        //   actions: [ new chrome.declarativeContent.ShowPageAction() ]
        // },
        {
          conditions: [
            // That fires when a page's URL contains a 'chrome' ...
            new chrome.declarativeContent.PageStateMatcher({
              pageUrl: { 
                hostEquals: 'www.youtube.com'//,
                // pathPrefix: '/watch'
              },
            })
          ],
          // And shows the extension's page action.
          actions: [ new chrome.declarativeContent.ShowPageAction() ]
        },
         {
          conditions: [
            // That fires when a page's URL contains a 'chrome' ...
            new chrome.declarativeContent.PageStateMatcher({
              pageUrl: { 
                // pathPrefix: '/watch',
                hostEquals: 'www.netflix.com'
              },
            })
          ],
          // And shows the extension's page action.
          actions: [ new chrome.declarativeContent.ShowPageAction() ]
        },
        {
          conditions: [
            // That fires when a page's URL contains a 'chrome' ...
            new chrome.declarativeContent.PageStateMatcher({
              pageUrl: { 
                hostEquals: 'nlv.bittubes.com',
                queryContains: 'uid='
              },
            })
          ],
          // And shows the extension's page action.
          actions: [ new chrome.declarativeContent.ShowPageAction() ]
        // },
        // {
        //   conditions: [
        //     // That fires when a page's URL contains a 'chrome' ...
        //     // setPageActionTitle(),
        //     new chrome.declarativeContent.PageStateMatcher({
        //       pageUrl: { hostEquals: 'app.viroomie.com' },
        //     })
        //   ],
        //   // And shows the extension's page action.
        //   actions: [ 
        //     // new chrome.declarativeContent.SetIcon({
        //     //    path : {
        //     //     "19" : "img/icon19_share.png",
        //     //     "38" : "img/icon38_share.png"
        //     //   }
        //     // }),
        //     setIconAction,
        //     new chrome.declarativeContent.ShowPageAction()
        //   ]
        }
      ]); // addRules
    }); // createSetIconAction
  }); // removeRules
}); // addListener