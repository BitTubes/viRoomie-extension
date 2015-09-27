/* jshint strict:false */


// var additionalInfo = {
//   "title": document.title,
//   "selection": window.getSelection().toString()
// };
// document.getElementById("m")

// chrome.runtime.connect().postMessage(additionalInfo);
// chrome.runtime.onConnect.addListener(function(port) {

// });

chrome.runtime.onMessage.addListener(function(message, sender, callback) {
	// console.log("message from popup.js:", message);
	switch(message.a) {
		case "state":
			callback("to-do");
		break;
		case "url":
			var m = document.getElementById("v_m");
			m.value = "/video "+message.url;
			var b = document.getElementById("bt_send");
			if(b.click) {
				b.click();
			}
			m.focus();
			callback(true);
		break;
		default:
		console.log("unknown state:", message.a);
			callback(false);

	}

});