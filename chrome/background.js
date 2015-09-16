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




var manifestData = chrome.runtime.getManifest();
// console.log(manifestData);
var msgHandler = function(request, sender, sendResponse) {
  if (request) {
    console.log("msg from:", sender, "msg:", request);
    if (request.message == "version") {
      sendResponse({version: manifestData.version});
      return true;
    }
    switch(request.a) {
    case "setRoom":
      localStorage.setItem("viroomie-room",request.room);
      sendResponse({room: localStorage.getItem("viroomie-room")});
      break;
    case "getRoom":
      sendResponse({room: localStorage.getItem("viroomie-room")});
      break;
    }
  }
  return true;
};
chrome.runtime.onMessageExternal.addListener( msgHandler );
chrome.runtime.onMessage.addListener( msgHandler);

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
            new chrome.declarativeContent.PageStateMatcher({
              pageUrl: { 
                hostEquals: 'www.youtube.com'//,
                // pathPrefix: '/watch'
              },
            }),
            new chrome.declarativeContent.PageStateMatcher({
              pageUrl: { 
                hostEquals: 'www.netflix.com'
              },
            }),
            new chrome.declarativeContent.PageStateMatcher({
              pageUrl: { 
                pathPrefix: '/webplayer/',
                hostEquals: 'play.maxdome.de'
              },
            }),


            // ************* MEDIATHEKEN **************
            // new chrome.declarativeContent.PageStateMatcher({
            //   // pageUrl: { 
            //   //   hostEquals: [
            //   //   'mediathek.rbb-online.de',
            //   //   'www.ardmediathek.de',
            //   //   'mediathek.daserste.de',
            //   //   'sr-mediathek.sr-online.de'
            //   //   ]
            //   // },
            //   css: ["video.ardplayer-mediacanvas"]
            // }),
            // new chrome.declarativeContent.PageStateMatcher({
            //   pageUrl: { 
            //     hostEquals: 'www.ardmediathek.de'
            //   },
            //   css: ["video.ardplayer-mediacanvas"]
            // }),
            // new chrome.declarativeContent.PageStateMatcher({
            //   pageUrl: { 
            //     hostEquals: 'mediathek.daserste.de'
            //   },
            //   css: ["video.ardplayer-mediacanvas"]
            // }),
            new chrome.declarativeContent.PageStateMatcher({
              pageUrl: {
                pathPrefix: '/tv/',
                hostEquals: 'mediathek.rbb-online.de'
              },
              css: ["video.ardplayer-mediacanvas"]
            }),
            // new chrome.declarativeContent.PageStateMatcher({
            //   pageUrl: { 
            //     hostEquals: 'sr-mediathek.sr-online.de'
            //   },
            //   css: ["video.ardplayer-mediacanvas"]
            // }),
            // new chrome.declarativeContent.PageStateMatcher({
            //   pageUrl: { 
            //     pathPrefix: '/mediathek/video/',
            //     hostEquals: 'www.br.de'
            //   },
            //   css: ["video.ready"] // they dont set the source before the user clicked on it once...
            // }),
            new chrome.declarativeContent.PageStateMatcher({
              pageUrl: { 
                pathPrefix: '/tv-sendung/',
                hostEquals: 'hessenschau.de' // HR / Hessischer Rundfunk
              },
              css: ["video"]
            }),
            // new chrome.declarativeContent.PageStateMatcher({
            //   pageUrl: { 
            //     pathPrefix: '/mediathek/video/',
            //     hostSuffix: 'wdr.de' // README can have multiple subdomains, requires a click
            //   },
            //   css: ["video"]
            // }),
            // MDR uses a popup-overlay http://www.mdr.de/mediathek
            // NDR adds the video only after clicking on an image http://www.ndr.de/mediathek/
            // SWR uses jwplayer and sets the url only after a click on an image http://www.swrmediathek.de/
            // DW adds the source only after a click http://www.dw.com/

            new chrome.declarativeContent.PageStateMatcher({
              pageUrl: { 
                pathPrefix: '/ZDFmediathek/',
                hostEquals: 'www.zdf.de'
              },
              css: ["video"]
            }),
            // ************* MEDIATHEKEN **************




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