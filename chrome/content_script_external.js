"use strict";

var baseDir = "http://app.viroomie.com/";
var scripts = [
	baseDir + 'js/lib/jquery-2.1.4.min.js',
	baseDir + 'js/lib/tabcomplete-1.5.1.min.js',
	baseDir + 'js/lib/notification-1.0.0.min.js',
	baseDir + 'js/lib/intro-1.0.1.min.js',
	baseDir + 'js/lib/socket.io-1.3.5.min.js',
	baseDir + 'js/lib/loader-external-1.0.0.min.js'
	// baseDir + 'js/client.min.js'
];
var styles = [
	'//fonts.googleapis.com/css?family=Source+Sans+Pro:400,700,400italic|Poiret+One',
	baseDir + 'css/style.css'
];
var EXTERNAL = {
	'www.netflix.com/watch': {
		'v' : 'nf',
		'p_playpause' : '.player-play-pause',
		'p_video' : 'video'
	},
	'play.maxdome.de': {
		'v' : 'md',
		'p_playpause' : '#player-controls--play-toggle',
		'p_video' : '#videoPlayer'
	},
	'www.maxdome.de': {
		'v' : 'md_pre',
		'pre' : true
	}
};

for(var el in EXTERNAL) {
	if(location.href.indexOf(el) !== -1) {
		EXTERNAL[el]['url'] = el;
		EXTERNAL = EXTERNAL[el];
		break;
	}
}
if(EXTERNAL['pre']) {
	EXTERNAL['url'] = null;
}

function $0(selector, base) {
	return $1(selector, base)[0];
}
function $1(selector, base) {
	// console.log("$0",selector,base);
	base = base || document;
	if(base.querySelectorAll) {
		// return base.querySelector(selector);
		return base.querySelectorAll(selector);
	}
	switch(selector.charAt(0)) {
		case ".":
			return base.getElementsByClassName(selector.substr(1));
			// break;
		case "#":
			return [document.getElementById(selector.substr(1))];
			// break;
		default:
			return base.getElementsByTagName(selector);
	}
}
function triggerClick(element) {
	var evt = document.createEvent("MouseEvents");
	evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);

	element.dispatchEvent(evt);
}
function addScript(urls, fn) {
	// console.log("addScripts", urls, fn);
	var url = urls.shift();
	var head = $0("head") || document.documentElement;
	var script = document.createElement('script');
	if(urls.length || fn) {
		var done = false;
		script.onload = script.onreadystatechange = function() {
			if ( !done && (!this.readyState ||
					this.readyState === "loaded" || this.readyState === "complete") ) {
				done = true;
				if(urls) {
					addScript(urls, fn);
				} else if(fn){
					fn();
				}
				// Handle memory leak in IE
				script.onload = script.onreadystatechange = null;
			}
		};			
	}
	script.type = 'text/javascript';
	script.src = url;
	head.appendChild(script);
}
function addStyle(url) {
	var link = document.createElement('link');
	link.rel = 'stylesheet';
	link.href = url;    
	$0('head').appendChild(link);
}
function addIncludes() {
	// console.log("addIncludes", fn);
	for(var i = 0; i < styles.length; i++) {
		addStyle(styles[i]);
	}
	testForExternalJquery();
	addScript(scripts);
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
function init(room) {
	// console.error("init",room);
	var info = $0('.viroomie_rejoin');
	if(info) {
		if(event) {
			event.preventDefault();
			event.stopPropagation();
		}
		info.parentNode.removeChild(info);
	}
	var startViroomie = $0('#startViroomie');
	if(!startViroomie) {
		console.log("start bt 404");
		addScript([baseDir + 'js/lib/loader-external-1.0.0.min.js?'+Date.now()], init.bind(null,room));
		return;
	}
	startViroomie.setAttribute("data-room", room);
	triggerClick(startViroomie);
	var video = $0(EXTERNAL['p_video']);
	if(video) {
		if(!video.paused) {
			$0(EXTERNAL['p_playpause']).click();
			// video.pause();
		}
	}
}
function testForExternalJquery() {
	var test = $1('script');
	for (var i = test.length - 1; i >= 0; i--) {
		if(test[i].src && test[i].src.indexOf('jquery') !==-1) {
			if(scripts[0].indexOf("jquery")!==-1) {
				scripts.splice(0,1);
				break;
			}
		}
	}
}
function loadFiles() {
	if(!$0('html').classList.contains("viroomie-loaded")) {
		addIncludes();
		return;
	}
}
function rejoin(vroom) {
	console.log("rejoin()");
	switch(EXTERNAL['v']) {
	case 'nf':
		if(!!window["netflix"] && !!window["netflix"]["cadmium"] && !!window["netflix"]["cadmium"]["objects"] && !!window["netflix"]["cadmium"]["objects"]["videoPlayer"]) {
			// console.log("retry in 100ms");
			window.setTimeout(rejoin.bind(null, vroom),100);
			return;
		} else {
			var video = $0(EXTERNAL['p_video']);
			var initialPause = function(){
				video.pause();
				setTimeout(function() {
					video.removeEventListener("timeupdate",initialPause, false);
				},5000);
			};
			video.addEventListener("timeupdate", initialPause, false);
		}
		break;
	case 'md':
		if(!$1(EXTERNAL['p_video']).length) {
			// console.log("retry in 100ms");
			window.setTimeout(rejoin.bind(null, vroom),100);
			return;
		} else {
			var video = $0(EXTERNAL['p_video']);
			var initialPause = function(){
				video.pause();
				setTimeout(function() {
					video.removeEventListener("timeupdate",initialPause, false);
				},2000);
			};
			video.addEventListener("timeupdate", initialPause, false);
		}
	}


	var body = $0("body") || document.documentElement;
	var info = document.createElement('div');
	info.classList.add('viroomie_rejoin');
	info.innerHTML = '<div><button class="viroomie_join">#'+vroom+'</button><hr><button class="viroomie_cancel"></button></div>';
	body.appendChild(info);
	$0('.viroomie_join').onclick = function() {
		init(vroom);
	};
	function cancel(event) {
		event.preventDefault();
		event.stopPropagation();
		info = $0('.viroomie_rejoin');
		info.parentNode.removeChild(info);
	}
	info.onclick = cancel;
	$0('.viroomie_cancel').onclick = cancel;

	if(!$0('html').classList.contains("viroomie-loaded")) {
		addIncludes();
		return;
	}

}
if(!window["viroomieListener"]) {
	window["viroomieListener"] = true;
	chrome.runtime.onMessage.addListener(function(message, sender, callback) {
		console.log("message from popup.js:", message);
		// console.log("jQuery",$);
		switch(message.a) {
			case "init":
				if($0("#viroomieExternalWrap") && $0("body.online")) {
					return;
				}
				if(!$0('html').classList.contains("viroomie-loaded")) {
					callback(428);
					return;
				}

				init(message.room);

				callback("started");
				break;
			case "load":
				if($0("#viroomieExternalWrap")) {
					return;
				}
				loadFiles();
				break;
			case "running":
				var cb_value = {
					"a": $0("#viroomieExternalWrap") && $0("body.online") ? "nf200" : "nf400",
					tabId : message.tabId,
					url : message.url
				};
				console.log(cb_value);
				callback(cb_value);
				break;
			default:
			console.log("unknown state:", message.a);
				callback(false);

		}

	});
	var hashRoom = _getRoomFromHash(location.href);
	if(hashRoom){
		console.log("set",hashRoom);
		chrome.runtime.sendMessage({"a": "setRoom", "room":hashRoom} );
		if(!$0("#viroomieExternalWrap") && location.href.indexOf(EXTERNAL['url'])!==-1) {
			rejoin(hashRoom);
		} else {
			console.log("other",EXTERNAL['v']);
			if(EXTERNAL['v']=='md_pre') {
				var container = $0(".col--cta.has-tooltip-list li");
				var hr = document.createElement('hr');
				hr.className = 'viroomie_hr';
				var button = document.createElement('button');
				button.className = "viroomie_cancel";
				// button.style.display="none";
				button.onclick = function() {
					document.body.classList.remove("viroomie_rejoin_md");
					button.parentNode.removeChild(button);
					hr.parentNode.removeChild(hr);
					chrome.runtime.sendMessage({"a": "setRoom", "room":""} );
				};
				container.appendChild(hr);
				container.appendChild(button);

				document.body.classList.add("viroomie_rejoin_md");
				document.body.classList.add("lang_de");
			}
		}
	} else {
		chrome.runtime.sendMessage({"a": "getRoom"}, function(response) {
			console.log("get",response["room"]);
			hashRoom = response["room"];
			if(hashRoom) {
				location.hash = "#room="+hashRoom;
				if(!$0("#viroomieExternalWrap") && location.href.indexOf(EXTERNAL['url'])!==-1) {
					rejoin(hashRoom);
				}
			}
		});
	}
}
console.info("content_script_external loaded");
