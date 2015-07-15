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
		if( roomCounter ) {
			buttonWrapper.style.display = "block";
			buttonWrapper.setAttribute("data-or", "or"); // TODO language
		}
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
		var node = document.getElementById('tabId'+tabId);
		console.log("hide",tabId, node);
		if(node) { // TODO check if this really works!!!
			node.parentNode.removeChild(node);
			if(!--roomCounter) {
				buttonWrapper.style.display = "none";
			}
			console.log("roomCounter", roomCounter);
		}
	});


	self.port.emit("loaded");
	buttonWrapper.style.display = "none";
	document.getElementById('external').style.display = "block";
});
