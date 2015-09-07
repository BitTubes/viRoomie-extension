var baseDir = "http://app.viroomie.com/";
var scripts = [
	baseDir + 'js/lib/jquery-2.1.4.min.js',
	baseDir + 'js/lib/tabcomplete-1.5.1.min.js',
	baseDir + 'js/lib/notification-1.0.0.min.js',
	baseDir + 'js/lib/intro-1.0.1.min.js',
	baseDir + 'js/lib/socket.io-1.3.5.min.js',
	baseDir + 'js/lib/loader-netflix-1.0.0.min.js'
	// baseDir + 'js/client.min.js'
];
var styles = [
	'//fonts.googleapis.com/css?family=Source+Sans+Pro:400,700,400italic|Poiret+One',
	baseDir + 'css/style.css'
];
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
				// if ( head && script.parentNode ) {
				// 	head.removeChild( script );
				// }
			}
		};			
	// } else {
	// 	$0("html").classList.add("viroomie-loaded");
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
	var i;
	for (i = 0; i < styles.length; i++) {
		addStyle(styles[i]);
	}
	// for (i = 0; i < scripts.length; i++) {
	// 	addScript(scripts[i]);
	// }
	addScript(scripts);
}
function _getDataFromHash(url) {
	if(url.indexOf("#")>=0) {
		var room=false,
			hashvar,
			hashvars = url.split("#")[1].split("&");
		// console.info(hashvars);
		for (var i = hashvars.length - 1; i >= 0; i--) {
			hashvar = hashvars[i].split("=");
			if(hashvar[0] == "room") {
				room = hashvar[1];
			}
		}
	}
	return [room];
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
		addScript([baseDir + 'js/lib/loader-netflix-1.0.0.min.js?'+Date.now()], init.bind(this,room));
		// window.setTimeout(init.bind(this,room),500);
		return;
	}
	startViroomie.setAttribute("data-room", room);
	triggerClick(startViroomie);
	var video = $0('video');
	if(video) {
		if(!video.paused) {
			$0('.player-play-pause').click();
			// video.pause();
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
	if((!!window["netflix"] && !!window["netflix"]["cadmium"] && !!window["netflix"]["cadmium"]["objects"] && !!window["netflix"]["cadmium"]["objects"]["videoPlayer"]) || !$1('video').length) {
		console.log("retry in 100ms");
		window.setTimeout(rejoin.bind(null, vroom),100);
		return;
	}
	console.error($1('video').length);
	var video = $0('video');
	var initialPause = function(){
		if(video.paused===false) {
			// $0('.player-play-pause').click();
			video.pause();
			setTimeout(function() {
				video.removeEventListener("timeupdate",initialPause, false);
			},5000);
		}
	};
	video.addEventListener("timeupdate", initialPause, false);

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
	};
	info.onclick = cancel;
	$0('.viroomie_cancel').onclick = cancel;

	if(!$0('html').classList.contains("viroomie-loaded")) {
		addIncludes();
		return;
	}

}
// if(!$0('html').classList.contains("viroomie-loaded")) {
if(!window["viroomieListener"]) {
	window["viroomieListener"] = true;
	chrome.runtime.onMessage.addListener(function(message, sender, callback) {
		console.log("message from popup.js:", message);
		// console.log("jQuery",$);
		switch(message.a) {
			case "init":
				if($0("#viroomieNetflixWrap") && $0("body.online")) {
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
				if($0("#viroomieNetflixWrap")) {
					return;
				}
				loadFiles();
				break;
			case "running":
				var cb_value = {
					"a": $0("#viroomieNetflixWrap") && $0("body.online") ? "nf200" : "nf400",
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
	if(!$0("#viroomieNetflixWrap") && location.href.indexOf("netflix.com/watch/")!==-1) {
		var hashvars = _getDataFromHash(location.hash);
		// console.log("hashvars:",hashvars);
		if(hashvars[0]) {
			rejoin(hashvars[0]);
		}
	}
}
console.info("content_script_netflix loaded");
