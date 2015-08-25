var baseDir = "http://app.viroomie.com/";
var scripts = [
	baseDir + 'js/lib/jquery-2.1.4.min.js',
	baseDir + 'js/lib/tabcomplete-1.5.1.min.js',
	baseDir + 'js/lib/notification-1.0.0.min.js',
	baseDir + 'js/lib/intro-1.0.0.min.js',
	baseDir + 'js/lib/socket.io-1.3.5.min.js',
	baseDir + 'js/lib/loader-netflix.js'
	// baseDir + 'js/client.min.js'
];
var styles = [
	'//fonts.googleapis.com/css?family=Source+Sans+Pro:400,700,400italic|Poiret+One',
	baseDir + 'css/style.css'
];
function $0(selector, base) {
	// console.log("$0",selector,base);
	base = base || document;
	if(base.querySelectorAll) {
		return base.querySelector(selector);
		// return base.querySelectorAll(selector)[0];
	}
	switch(selector.charAt(0)) {
		case ".":
			return base.getElementsByClassName(selector.substr(1))[0];
			break;
		case "#":
			return document.getElementById(selector.substr(1));
			break;
		default:
			return base.getElementsByTagName(selector)[0];
	}
}
function triggerClick(element) {
	var evt = document.createEvent("MouseEvents");
	evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);

	element.dispatchEvent(evt);
}
function addScript(urls) {
	console.log("addScripts",urls);
	var url = urls.shift();
	var head = $0("head") || document.documentElement;
	var script = document.createElement('script');
	if(urls.length) {
		var done = false;
		script.onload = script.onreadystatechange = function() {
			if ( !done && (!this.readyState ||
					this.readyState === "loaded" || this.readyState === "complete") ) {
				done = true;
				addScript(urls);
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
	var i;
	for (i = 0; i < styles.length; i++) {
		addStyle(styles[i]);
	}
	// for (i = 0; i < scripts.length; i++) {
	// 	addScript(scripts[i]);
	// }
	addScript(scripts);
}

if(!$0('html').classList.contains("viroomie-loaded")) {
	addIncludes();
	chrome.runtime.onMessage.addListener(function(message, sender, callback) {
		console.log("message from popup.js:", message);
		// console.log("jQuery",$);
		switch(message.a) {
			case "init":
				var startViroomie = $0('#startViroomie');
				triggerClick(startViroomie);
				var video = $0('video');
				if(video) {
					if(!video.paused) {
						$0('.player-play-pause').click();
						// video.pause();
					}
				}
				callback("started");
			break;
			default:
			console.log("unknown state:", message.a);
				callback(false);

		}

	});
}