/* jshint node:true */
/*globals chrome:false*/
"use strict";

var _ = chrome.i18n.getMessage;

var baseDir = "http://app.viroomie.com/";
var scripts = [
	baseDir + 'js/lib/jquery-2.1.4.min.js',
	baseDir + 'js/lib/tabcomplete-1.5.1.min.js',
	baseDir + 'js/lib/notification-1.0.0.min.js',
	baseDir + 'js/lib/intro-1.0.1.min.js',
	baseDir + 'js/lib/socket.io-1.3.5.min.js',
	// baseDir + 'js/lib/loader-external-1.1.0.min.js'
	// baseDir + 'js/client.min.js'
];
var styles = [
	'//fonts.googleapis.com/css?family=Source+Sans+Pro:400,700,400italic|Poiret+One',
	baseDir + 'css/style.css'
];
var mediathek_ard = {
	v : 'ard',
	p_playpause : '.ardplayer-btn-playpause',
	p_video : 'video.ardplayer-mediacanvas',
	initialPauseDelay : 500,
	loader : baseDir + 'js/lib/loader-external-rbb-1.3.0.min.js',
	continuous : true,
	checkVideoExists : true,
	setCookie : "ard_mediathek_player_settings="+encodeURIComponent('{"changedVolumeValue":1,"changedMuteValue":false,"lastUsedPlugin":1}')
};
// var mediathek_rbb = mediathek_ard;
// mediathek_rbb.v = 'rbb';
var EXTERNAL,
	loaderPushed = false,
	EXTERNALS = {
	"www.ardmediathek.de": mediathek_ard,
	"mediathek.daserste.de": mediathek_ard,
	// "sr-mediathek.sr-online.de": mediathek_ard,
	// "hessenschau.de" : mediathek_ard,
	"mediathek.rbb-online.de/tv": mediathek_ard,

	'www.zdf.de/ZDFmediathek': {
		v : 'zdf',
		p_playpause : '#zdfplayer1_playPauseButton',
		p_video : 'video',
		initialPauseDelay : 500,
		loader : baseDir + 'js/lib/loader-external-1.3.0.min.js'
	},

	'www.netflix.com/watch': {
		v : 'nf',
		p_playpause : '.player-play-pause',
		p_video : 'video',
		initialPauseDelay : 5000,
		loader : baseDir + 'js/lib/loader-external-1.3.0.min.js',
		continuous : true
	},
	'play.maxdome.de': {
		v : 'md',
		p_playpause : '#player-controls--play-toggle',
		p_video : '#videoPlayer',
		initialPauseDelay : 500,
		loader : baseDir + 'js/lib/loader-external-1.3.0.min.js'
	},

	// pre-player-loaders
	'www.maxdome.de': {
		v : 'md',
		pre : true
	},
	'www.netflix.com/title': {
		v : 'nf',
		pre : true,
		continuous : true
	}
};
function setExternal() {
	EXTERNAL = {};
	for(var el in EXTERNALS) {
		if(location.href.indexOf(el) !== -1) {
			EXTERNAL = EXTERNALS[el];
			EXTERNAL.url = el;
			if(!loaderPushed && EXTERNAL.loader) {
				loaderPushed=true;
				scripts.push(EXTERNAL.loader);
			}
			if(EXTERNAL.checkVideoExists) {
				EXTERNAL.pre = !$1("video").length;
			}
			break;
		}
	}
	if(EXTERNAL.pre) {
		EXTERNAL.url = null;
	}
	if(EXTERNAL.setCookie) {
		var date = new Date();
        date.setTime(date.getTime()+(365*24*60*60*1000));
		document.cookie = EXTERNAL.setCookie+'; expires='+date.toGMTString()+'; path=/';
	}
	// console.log(EXTERNAL);
}
setExternal();



// +++++++ UTIL +++++++
function $0(selector, base) {
	return $1(selector, base)[0];
}
function $1(selector, base) {
	// console.log("$0",selector,base);
	base = base || document;
	if(base.querySelectorAll) {
		return base.querySelectorAll(selector);
	} else {
		return [];
	}
}
function triggerClick(element) {
	var evt = document.createEvent("MouseEvents");
	evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);

	element.dispatchEvent(evt);
}



// +++++++ LOADERS +++++++
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
	if(scripts.length) {
		testForExternalJquery();
		addScript(scripts);
	}
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
	}
	var startViroomie = $0('#startViroomie');
	if(!startViroomie) {
		// console.log("start bt 404");
		addScript([EXTERNAL.loader+'?'+Date.now()], init.bind(null,room));
		return;
	}
	startViroomie.setAttribute("data-room", room);
	// console.log("new room",startViroomie.getAttribute("data-room"));
	triggerClick(startViroomie);
	var video = $0(EXTERNAL.p_video);
	if(video) {
		if(!video.paused) {
			$0(EXTERNAL.p_playpause).click();
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
	// console.error("loadFiles");
	if(!$0('html.viroomie-loaded')) {
		addIncludes();
		return;
	} else {

	}
}
var specialChar = {
	regexp : /[^a-z0-9+\.\[\]\(\)~|!§$%&{}ßäöü_-]/gi,
	filter : function() {
		var txt = this.value;

		if ( txt.match(specialChar.regexp) ){
			this.value = txt.replace(specialChar.regexp, '');
		}
	}
};
function join(rejoin, vroom) {
	// console.error("join",rejoin, vroom);
	if($1(".viroomie_rejoin").length) { // in case we pressed the popup-button before...
		// console.log("viroomie_rejoin found - this would have ended join()");
		killViroomie();
		// return;
	}
	if(!EXTERNAL.pre) {
		switch(EXTERNAL.v) {
		case 'nf':
			if((!!window["netflix"] && !!window["netflix"]["cadmium"] && !!window["netflix"]["cadmium"]["objects"] && !!window["netflix"]["cadmium"]["objects"]["videoPlayer"]) || !$1('video').length) {	
				// console.log("retry in 100ms");
				window.setTimeout(join.bind(null, rejoin, vroom),100);
				return;
			}
			var resetPlayBtn = function() { // pausing the video manually will leave netflix's JS and UI in the wrong state
				var div = $1(".player-play-pause");
				if(!div.length) {
					window.setTimeout(resetPlayBtn, 200);
				} else if(div[0].classList.contains("pause")) { // only trigger click if button is in playing-mode
					triggerClick(div[0]);
				}
			};
			resetPlayBtn();
			break;
		case 'zdf':
			$0("#flashHinweis").style.display = "none";
			$0("#linkDownloadFlash").style.display = "none";
			// no break here
		case 'ard':
		case 'rbb':
		case 'md':
			if(!$1(EXTERNAL.p_video).length) {
				console.log("retry in 100ms");
				window.setTimeout(join.bind(null, rejoin, vroom),100);
				return;
			}
		}
	}
	var video = $0(EXTERNAL.p_video);
	var initialPause = function(){
		video.pause();
		setTimeout(function() {
			video.removeEventListener("timeupdate",initialPause, false);
		},EXTERNAL.initialPauseDelay);
	};
	video.addEventListener("timeupdate", initialPause, false);


	var body = $0("body");
	var p_rejoin = $1(".viroomie_rejoin");
	if(!p_rejoin.length) { // in case we pressed the popup-button before...
		p_rejoin = document.createElement('div');
		p_rejoin.classList.add('viroomie_rejoin');
		p_rejoin.classList.add('viroomie');
		p_rejoin.innerHTML = '<div><input class="viroomie_usernameInput" type="text" maxlength="20" placeholder="'+_("my_name")+'" autofocus><br><button class="viroomie_join" '+ (vroom?'data-room="'+vroom+'"':'') +'></button><hr><button class="viroomie_cancel"></button></div>';
		body.appendChild(p_rejoin);
		var input = $0('.viroomie_usernameInput');
		input.onkeyup = specialChar.filter;
		input.onclick = function() {
			event.stopPropagation();
			// init(vroom);
			// p_rejoin.style.display = "none";
		};
		function cancel(event) {
			// console.log("rejoin cancel");
			// console.info("remove child", p_rejoin);
			event.preventDefault();
			event.stopPropagation();
			// location.hash = "";
			chrome.runtime.sendMessage({"a": "setRoom", "room":"", "video":"", "player":EXTERNAL.v});
			hashRoom = "";
			p_rejoin.parentNode.removeChild(p_rejoin);
		}
		// p_rejoin.onclick = cancel;
		$0('.viroomie_cancel').onclick = cancel;
	} else {
		p_rejoin = p_rejoin[0];
	}
	$0('.viroomie_join').onclick = function() {
		// console.log("rejoin join", vroom);
		event.stopPropagation();
		init(vroom);
		p_rejoin.style.display = "none";
		var temp = $0("#viroomieExternalWrap");
		if(temp) {
			temp.style.display = "block";
		}
	};
	if(!rejoin || viroomieKilled) { //  only do this on manual join (via popup.js)
		// console.error("reload loader");
		viroomieKilled = false;
		if(vroom) {
			$0(".viroomie_join").setAttribute("data-room",vroom);
		} else {
			$0(".viroomie_join").removeAttribute("data-room");
		}
		$0("#restartViroomie").click();

		addScript([EXTERNAL.loader+'?'+Date.now()]);
		p_rejoin.style.display = "block";
	}

	// console.log("loading files");
	loadFiles();

}
if(!window["viroomieListener"]) {
	window["viroomieListener"] = true;
	var currentVideo = location.protocol + '//' + location.host + location.pathname + location.search;
	chrome.runtime.onMessage.addListener(function(message, sender, callback) {
		// console.log("message from popup.js/external:", message);
		// console.log("jQuery",$);
		switch(message.a) {
			case "init":
				if($0("#viroomieExternalWrap") && $0("body.online")) {
					console.log(500);
					callback(500);
					top.location.reload();
					return;
				}
				if(!$0('html').classList.contains("viroomie-loaded")) {
					console.log(428);
					callback("428rl");
					top.location.reload();
					return;
				}
				if(message["video"] && currentVideo != message["video"]) {
					message.room = "";
				}
				join(false, message.room);

				callback("started");
				break;
			case "load":
				if($0("#viroomieExternalWrap")) {
					return;
				}
				loadFiles();
				callback(EXTERNAL.v);
				break;
			case "running":
				var cb_value = {
					"a": ($0("#viroomieExternalWrap") && $0("body.online")) ? "nf200" : "nf400",
					tabId : message.tabId,
					url : message.url
				};
				// console.log("cb_value", cb_value);
				callback(cb_value);
				break;
			case "newroom":
				if(!hashRoom && !EXTERNAL.continuous) {
					checkUrlChange();
				}
				hashRoom = message["room"];
				break;
			default:
			// console.log("unknown state:", message.a);
				callback(false);

		}

	});
	var viroomieKilled=false;
	var killViroomie = function() {
		// console.error("killViroomie");
		var temp;
		// console.log("remove html");
		if($1(".viroomie_rejoin").length) { // in case we pressed the popup-button before...
			temp = $0(".viroomie_rejoin");
			temp.style.display = "none";
			// temp.parentNode.removeChild(temp);
		}
		if($1("#viroomieExternalWrap").length) {
			viroomieKilled = true;
			$0("#killViroomie").click();
			// var socket = $0("html") && $("html").data("viroomie");
			// if(socket) {
			// 	socket["disconnect"]();
			// 	$("html").data("viroomie",null);
			// }
			temp = $0("#viroomieExternalWrap");
			temp.style.display = "none";
			// temp.parentNode.removeChild(temp);
		}
		if($1("body.online").length) {
			document.body.classList.remove("online");
		}
		// if($1(".viroomie-loaded").length) {
		// 	$0("html").classList.remove("viroomie-loaded");
		// }
	};
	var externalChangeTrack = null;
	var externalChangeTrackPre = null;
	var checkUrlChange = function(){
		// console.log("checkUrlChange");
		if(!hashRoom && !EXTERNAL.continuous) {
			// console.log("quitting - no room saved");
			return;
		}
		setExternal();
		if(EXTERNAL.continuous) {
			// console.log("continuous", EXTERNAL.url !== externalChangeTrack , EXTERNAL.pre !== externalChangeTrackPre);
			if(EXTERNAL.url !== externalChangeTrack || EXTERNAL.pre !== externalChangeTrackPre) {
				// console.log("pre",EXTERNAL.pre);
				if(EXTERNAL.pre) {
					killViroomie();
				} else {
					chrome.runtime.sendMessage({"a": "getRoom", "player":EXTERNAL.v}, function(response) {
						// console.log("re-get",response);
						currentVideo = location.protocol + '//' + location.host + location.pathname + location.search;
						hashRoom = response["room"];
						if(response["video"] && currentVideo != response["video"]) {
							hashRoom = "";
							chrome.runtime.sendMessage({"a": "setRoom", "room":"", "video":"", "player":EXTERNAL.v} );
						}
						if(hashRoom) {
							handleHashFound();
						}
					});
				}
				// if(EXTERNAL.pre) {
				// 	killViroomie();
				// } else if(!EXTERNAL.pre && hashRoom) {
				// 	handleHashFound();
				// }
			}
			externalChangeTrack = EXTERNAL.url;
			externalChangeTrackPre = EXTERNAL.pre;
			window.setTimeout(checkUrlChange, 3000);
		} else if(hashRoom) {
			handleHashFound();
		}
	};

	var handleHashFound = function() {
		// console.log("handleHashFound");
		if(!$0("#viroomieExternalWrap") && location.href.indexOf(EXTERNAL.url)!==-1) {
			// console.log("join");
			join(true, hashRoom);
		} else {
			// console.log("other",EXTERNAL.v);
			switch(EXTERNAL.v) {
				case 'md':
					if(!EXTERNAL.pre) {
						return;
					}
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
						chrome.runtime.sendMessage({"a": "setRoom", "room":"", "video":"", "player":EXTERNAL.v});
					};
					container.appendChild(hr);
					container.appendChild(button);

					document.body.classList.add("viroomie_rejoin_md");
					document.body.classList.add("lang_de");
				break;
			}
		}
	};
	var hashRoom = _getRoomFromHash(location.href);
	if(hashRoom){
		// console.log("set",hashRoom);
		chrome.runtime.sendMessage({"a": "setRoom", "room":hashRoom, "video":"", "player":EXTERNAL.v} );

		// handleHashFound();
		checkUrlChange();
	} else {
		chrome.runtime.sendMessage({"a": "getRoom", "player":EXTERNAL.v}, function(response) {
			// console.log("get",response);
			hashRoom = response["room"];
			if(response["video"] && currentVideo != response["video"]) {
				hashRoom = "";
				chrome.runtime.sendMessage({"a": "setRoom", "room":"", "video":"", "player":EXTERNAL.v} );
			}
			if(hashRoom || EXTERNAL.continuous) {
				// location.hash = "#room="+hashRoom;
				// handleHashFound();
				checkUrlChange();
			}
		});
	}
}
// console.info("content_script_external loaded");
