var baseDir = "http://app.viroomie.com/";
var scripts = [
	// baseDir + 'js/lib/jquery-2.1.4.min.js',
	baseDir + 'js/lib/tabcomplete-1.5.1.min.js',
	baseDir + 'js/lib/notification-1.0.0.min.js',
	baseDir + 'js/lib/intro-1.0.0.min.js',
	baseDir + 'js/lib/socket.io-1.3.5.min.js',
	baseDir + 'js/client.min.js'
];
var styles = [
	'//fonts.googleapis.com/css?family=Source+Sans+Pro:400,700,400italic|Poiret+One',
	baseDir + 'css/style.css'
];
function addScript(url, callback) {
	var head = document.getElementsByTagName("head")[0] || document.documentElement;
	var script = document.createElement('script');
	script.type = 'text/javascript';
	script.src = url;
	if(callback) {
		var done = false;
		script.onload = script.onreadystatechange = function() {
			if ( !done && (!this.readyState ||
					this.readyState === "loaded" || this.readyState === "complete") ) {
				done = true;
				callback();
				// Handle memory leak in IE
				script.onload = script.onreadystatechange = null;
				if ( head && script.parentNode ) {
					head.removeChild( script );
				}
			}
		};			
	}
	head.appendChild(script);
}
function addStyle(url) {
	var link = document.createElement('link');
	link.rel = 'stylesheet';
	link.href = url;    
	document.getElementsByTagName('head')[0].appendChild(link);
}
function addIncludes() {
	var i;
	for (i = 0; i < styles.length; i++) {
		addStyle(styles[i]);
	}
	for (i = 0; i < scripts.length; i++) {
		addScript(scripts[i]);
	}
}
addScript(baseDir + 'js/lib/jquery-2.1.4.min.js', addIncludes);
