/* jshint strict:false */



function executeMailto(tab_id, subject, body, selection) {
  var action_url = "mailto:?";
  if (subject.length > 0) {
    action_url += "subject=" + encodeURIComponent(subject) + "&";
  }

  if (body.length > 0) {
    action_url += "body=" + encodeURIComponent(body);

    // Append the current selection to the end of the text message.
    if (selection.length > 0) {
      action_url += encodeURIComponent("\n\n") +
          encodeURIComponent(selection);
    }
  }

  // Plain vanilla mailto links open up in the same tab to prevent
  // blank tabs being left behind.
  // console.log('Action url: ' + action_url);
  chrome.tabs.update(tab_id, { url: action_url });
}
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