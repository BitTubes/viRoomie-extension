/* jshint strict:false */

// var tabs = require("sdk/tabs");

//  +++++++++++++++ GOOGLE ANALYTICS ++++++++++++

// var _gaq = _gaq || [];
// _gaq.push(['_setAccount', 'UA-65099990-3']);
// _gaq.push(['_trackPageview']);

// (function() {
//   var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
//   ga.src = 'https://ssl.google-analytics.com/ga.js';
//   var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
// })();



//  +++++++++++++++ OPEN VIDEO ++++++++++++

// function updateViroom(url, tabId, windowId) {
//   chrome.tabs.sendMessage(tabId, {"a":"url", "url":url}, function(data) {
//     console.log("response from content-script: ",data);
//     chrome.tabs.update(tabId, { // make tab active in its window
//       active:true
//     }, function() {
//       if (chrome.runtime.lastError) {
//           console.log(chrome.runtime.lastError.message);
//           var button = document.getElementById("tabId"+tabId);
//           button.parentNode.removeChild(button);
//       } else {
//         chrome.windows.update(windowId, { // make tab's window active
//           drawAttention:true, // blink
//           focused:true // bring window to front
//         }, function() {});
//         window.close();
//       }
//     });
//   });
// }




// function findViRoomieTabs(url) {
//   var buttonWrapper = document.getElementById('updateapps');
//   buttonWrapper.setAttribute("data-msg", chrome.i18n.getMessage("searching_rooms"));

//   var queryInfo = {
//     status: "complete",
//     url: "http://app.viroomie.com/*"
//   };
//   var room,
//     hashvars,
//     hashvar,
//     roomCounter = 0,
//     tab;
//   chrome.tabs.query(queryInfo, function(tabs) {
//     buttonWrapper.removeAttribute("data-msg");
//     urls = "";
//     for(var el in tabs) {
//       tab = tabs[el];
//       if(tab.url.indexOf("#")>=0) {
//         room = false;
//         hashvars = tab.url.split("#")[1].split("&");
//         for (var i = hashvars.length - 1; i >= 0; i--) {
//           hashvar = hashvars[i].split("=");
//           if(hashvar[0] == "room") {
//             room = hashvar[1];
//             break;
//           }
//         }
//         if(room) {
//           roomCounter++;
//           addElement(url, room, tab.id, tab.windowId);
//         }
//       }
//     }
//     if(roomCounter) {
//       buttonWrapper.setAttribute("data-or", chrome.i18n.getMessage("or"));
//     } else {
//       buttonWrapper.style.display = "none";
//     }
//   });

// }



// //  +++++++++++++++ UTIL ++++++++++++
// var currentTabId = null;
// function getCurrentTabUrl(callback) {
//   // Query filter to be passed to chrome.tabs.query - see
//   // https://developer.chrome.com/extensions/tabs#method-query
//   var queryInfo = {
//     active: true,
//     currentWindow: true
//   };

//   chrome.tabs.query(queryInfo, function(tabs) {
//     // chrome.tabs.query invokes the callback with a list of tabs that match the
//     // query. When the popup is opened, there is certainly a window and at least
//     // one tab, so we can safely assume that |tabs| is a non-empty array.
//     // A window can only have one active tab at a time, so the array consists of
//     // exactly one tab.
//     var currentTab = tabs[0];
//     currentTabId = currentTab.id;
//     // A tab is a plain object that provides information about the tab.
//     // See https://developer.chrome.com/extensions/tabs#type-Tab
//     var url = currentTab.url;

//     // tab.url is only available if the "activeTab" permission is declared.
//     // If you want to see the URL of other tabs (e.g. after removing active:true
//     // from |queryInfo|), then the "tabs" permission is required to see their
//     // "url" properties.
//     console.assert(typeof url == 'string', 'tab.url should be a string');

//     callback(url);
//   });
//   // Most methods of the Chrome extension APIs are asynchronous!
// }
// function processUrl(url, viroomieCallback, externalCallback) {
//   if(url.indexOf("//app.viroomie.com")>0) {
//     viroomieCallback(url);
//   } else {
//     externalCallback(url);
//   }
// }


document.addEventListener('DOMContentLoaded', function() {
	var buttonWrapper = document.getElementById('updateapps');

	function sendButtonClick() {
		var tab = this.id;
		self.port.emit("clicked", tab);
	}
  document.getElementById('openapp').onclick = sendButtonClick;

	function addElement(room, tabId) { 
	  // create a new div element 
	  // and give it some content 
	  var newButton = document.createElement("button"); 
	  var newContent = document.createTextNode("open_in_existing "+ room); // TODO language
	  newButton.setAttribute("id", "tabId"+tabId);
	  newButton.onclick = sendButtonClick;
	  newButton.appendChild(newContent); //add the text node to the newly created div. 

	 buttonWrapper.appendChild(newButton);
	}


	var roomCounter = 0;
	function showButtons(data) {
		for (var i = data.length - 1; i >= 0; i--) {
			roomCounter++;
			addElement(data[i].room, data[i].id);
		}
		buttonWrapper.style.display = "block";
	  buttonWrapper.setAttribute("data-or", "or"); // TODO language
	}
	self.port.on("show", function onShow(data) {
		console.log("show",data);
		buttonWrapper.innerHTML = "";
		showButtons(data);
	});
	self.port.on("show1", function onShow(data) {
		console.log("show1",data);
		showButtons([data]);
	});

	self.port.on("hide", function onHide(tabId) {
		console.log("hide",tabId);
		var node = document.getElementById('tabId'+tabId);
		if(node) { // TODO check if this really works!!!
			node.parentNode.removeChild(node);
			if(!--roomCounter) {
				buttonWrapper.style.display = "none";
			}
		}
	});


	self.port.emit("loaded");
//   getCurrentTabUrl(function(url) {
//     processUrl(url, function() { // inside viRoomie

//     }, function(url) { // external website
      
//       if(url.indexOf("youtube.com/watch")>0 || url.indexOf("//nlv.bittubes.com")>=0) {
//         document.getElementById('openapp').innerHTML = chrome.i18n.getMessage("open_new");
//         findViRoomieTabs(url);
//       } else {
//         document.getElementById('msg').innerHTML = chrome.i18n.getMessage("open_video_error");
//         document.getElementById('updateapps').style.display = "none";
//         document.getElementById('openapp').style.display = "none";
//       }
      // document.getElementById('external').style.display = "block";
//     });
//   });
});
