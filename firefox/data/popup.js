/* jshint strict:false */

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
var LOCALE = null;
function _(index, replacements) { // thanks Mozilla for making me write this for you
	var str = LOCALE[index];
	if(!str) {
		console.error("Huston, we have a problem!");
		return "grrrRRRRR";
	}
	var i=1;
	if(!replacements) {
		return str;
	}
	if("string" == typeof replacements) {
		return str.split("$"+i).join(replacements);
	} else { // assume array
		for (i = 1; i <= replacements.length; i++) {
			str = str.split("$"+i).join(replacements[i-1]);
		}
		return str;
	}
}

document.addEventListener('DOMContentLoaded', function() {
	var p_updateapps = document.getElementById('updateapps');
	var p_openapp = document.getElementById('openapp');
	var p_msg = document.getElementById('msg');
	var roomCounter = 0;

	function sendButtonClick() {
		var tab = this.id;
		addon.port.emit("clicked", tab);
	}
	p_openapp.onclick = sendButtonClick;

	function addElement(room, tabId) { 
		// create a new div element 
		// and give it some content 
		var newButton = document.createElement("button"); 
		var newContent = document.createTextNode(_("open_in_existing", room));
		newButton.setAttribute("id", "tabId"+tabId);
		newButton.onclick = sendButtonClick;
		newButton.appendChild(newContent); //add the text node to the newly created div. 

	 p_updateapps.appendChild(newButton);
	}
	function onError(msg) {
		p_updateapps.style.display = "none";
		p_openapp.style.display = "none";
		p_msg.textContent = _(msg);
	}

	function showButtons(data) {
		for (var i = data.length - 1; i >= 0; i--) {
			roomCounter++;
			addElement(data[i].room, data[i].id);
		}
		if( roomCounter ) {
			console.log("show p_updateapps",roomCounter);
			p_updateapps.style.display = "block";
			p_updateapps.setAttribute("data-or", _("or"));
		} else {
			console.log("hide p_updateapps");
			p_updateapps.style.display = "none";
		}
		p_openapp.style.display = "block";
		p_msg.innerHTML = "";
	}
	addon.port.on("show", function onShow(data) {
		console.log("show",data);
		p_updateapps.style.display = "block";
		p_openapp.style.display = "block";
		p_updateapps.innerHTML = "";
		showButtons(data);
	});
	addon.port.on("show1", function onShow(data) {
		console.log("show1",data);
		showButtons([data]);
	});
	addon.port.on("error", onError);
	// addon.port.on("open_video_error", onError.bind(null,"open_video_error"));
	// addon.port.on("embed_video_error", onError.bind(null,"embed_video_error"));
	// addon.port.on("loading", onError.bind(null,"loading"));

	addon.port.on("hide", function onHide(tabId) {
		var node = document.getElementById('tabId'+tabId);
		console.log("hide",tabId, node);
		if(node) {
			node.parentNode.removeChild(node);
			if(!--roomCounter) {
				p_updateapps.style.display = "none";
			}
			console.log("roomCounter", roomCounter);
		}
	});

	addon.port.on("locale", function(data) {
		LOCALE = data;
		p_openapp.textContent = _("open_new");
	});

	addon.port.emit("loaded");
	p_updateapps.style.display = "none";
	document.getElementById('external').style.display = "block";
});
