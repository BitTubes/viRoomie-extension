/* jshint node:true, strict:false */
"use moz";

var self = require('sdk/self');

// a dummy function, to show how tests work.
// to see how to test this function, look at test/test-index.js
function dummy(text, callback) {
	callback(text);
}

exports.dummy = dummy;


var tbuttons = require('sdk/ui/button/toggle');
var tabs = require("sdk/tabs");
var panels = require("sdk/panel");

var rommTabIds = {};
var roomCount = 0;

function updatePanelHeight() {
	var height = panel_h["bodymargin"] + panel_h["button"];
	if(roomCount) {
		height += roomCount*panel_h["button"] + panel_h["updateapps"];
	}
	panel.resize(panel_w, height);
}
function onCloseRoom(tab) {
	console.log("close", tab.id);
	panel.port.emit("hide", tab.id);
	delete rommTabIds[tab.id];
	roomCount--;
	updatePanelHeight();
}
tabs.on('pageshow', function(tab) {
	console.log("pageshow:",tab.url);
	var room = getRoomFromHash(tab.url);
	if(room && !rommTabIds[tab.id]) {
		console.log("pageshow room opened",tab);
		panel.port.emit("show1", {"id": tab.id, "room": room});
		tab.on("close",onCloseRoom);
		rommTabIds[tab.id] = room;
		roomCount++;
		updatePanelHeight();
	} else if(rommTabIds[tab.id] && !room) {
		console.log("pageshow room closed",tab);
		onCloseRoom(tab);
	} else if(room && rommTabIds[tab.id] && room != rommTabIds[tab.id]){
		console.log("pageshow room changed",tab, room);
		panel.port.emit("hide", tab.id); // this will produce false positives
		panel.port.emit("show1", {"id": tab.id, "room": room});
		rommTabIds[tab.id] = room;
	} else {
		console.log("pageshow no change necessary",tab);
	}
});
tabs.on('activate', function (tab) {
	console.log('active: ' + tabs.activeTab.url);
	if(tabs.activeTab.url.indexOf("//www.youtube.com") > 0 
		|| tabs.activeTab.url.indexOf("localhost") >= 0 
		|| (
			tabs.activeTab.url.indexOf("//nlv.bittubes.com") > 0 && tabs.activeTab.url.indexOf("uid=")
			)
		) { 
		console.log("youtube or bt localhost activated", tab);
	} else {
		console.log("other tab activated", tab);
	}
});
var button = tbuttons.ToggleButton({
	id: "viroomie",
	label: "viRoomie", // TODO language
	icon: {
		"16": "./img/icon16.png",
		"32": "./img/icon32.png",
		"64": "./img/icon64.png",
		"128": "./img/icon128.png",
		"256": "./img/icon256.png",
	},
	onClick: handleToggleClick
});

function handleHide() {
	button.state('window', {checked: false});
}

var panel_h = {},
	panel_w;
panel_h["button"] = 29;
panel_h["bodymargin"] = 16+10;
panel_h["updateapps"] = 30;
panel_w = 216;


var panel = panels.Panel({
	contentURL: self.data.url("popup.html"),
	contentScriptFile: ["./popup.js"],
	contentScriptWhen: "ready",
	// contextMenu: true,
	height: panel_w,
	width: panel_h["bodymargin"] + panel_h["button"],
	onHide: handleHide
});

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
panel.port.on("loaded", function(){
	console.log("loaded");
});
panel.port.on("clicked", function(tabid){
	console.log("clicked", tabid);
});

function handleToggleClick(state) {
	console.log("handleToggleClick",state);
	if (state.checked) {
		panel.show({
			position: button
		});

		var myTabs = [],
			tab,
			room;
		roomCount = 0;
		for (var i = tabs.length - 1; i >= 0; i--) {
			tab = tabs[i];
			room = getRoomFromHash(tab.url);
			if(room) {
				roomCount++;
				myTabs.push({"id": tab.id, "room": room});
			}
		}
		updatePanelHeight();
		console.log("myTabs", myTabs, tabs);
		panel.port.emit("show", myTabs);
	}
}




var pageMod = require("sdk/page-mod");

pageMod.PageMod({
	include: "app.viroomie.com",
	contentScriptFile: ["./load_video_content_script.js"]
});





// ++++++++++++++++++ popup

function openViRoomie(url) {
	tabs.open("http://app.viroomie.com#video="+(url.split("=").join("%3D").split("&").join("%26")));
}
