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
		var newContent = document.createTextNode(_("open_in_existing", room));
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
		if( roomCounter ) {
			buttonWrapper.style.display = "block";
			buttonWrapper.setAttribute("data-or", _("or"));
		}
		document.getElementById('updateapps').style.display = "block";
		document.getElementById('openapp').style.display = "block";
		document.getElementById('msg').innerHTML = "";
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
	self.port.on("open_video_error", function onShow(data) {
		console.log("show",data);
		document.getElementById('updateapps').style.display = "none";
		document.getElementById('openapp').style.display = "none";
		document.getElementById('msg').innerHTML = _("open_video_error");
	});

	self.port.on("hide", function onHide(tabId) {
		var node = document.getElementById('tabId'+tabId);
		console.log("hide",tabId, node);
		if(node) {
			node.parentNode.removeChild(node);
			if(!--roomCounter) {
				buttonWrapper.style.display = "none";
			}
			console.log("roomCounter", roomCounter);
		}
	});

	self.port.on("locale", function(data) {
		LOCALE = data;
		document.getElementById('openapp').innerHTML = _("open_new");
	});

	self.port.emit("loaded");
	buttonWrapper.style.display = "none";
	document.getElementById('external').style.display = "block";
});
