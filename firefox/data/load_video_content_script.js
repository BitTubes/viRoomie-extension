/* jshint strict:false */


// chrome.runtime.onMessage.addListener(function(message, sender, callback) {
// 	console.log("message from popup.js:", message);
// 	switch(message.a) {
// 		case "state":
// 			callback("to-do");
// 		break;
// 		case "url":
// 			var m = document.getElementById("m");
// 			m.value = "/video "+message.url;
// 			m.focus();
// 			document.getElementById("m");
// 			callback(true);
// 		break;
// 		default:
// 		console.log("unknown state:", message.a);
// 			callback(false);

// 	}

// });
self.port.on("viroomie", function(message) {
	var callback_msg;
	switch(message.a) {
		case "state":
			callback_msg = "to-do";

		break;
		case "url":
			try {
				var m = document.getElementById("m");
				m.value = "/video "+message.url;
				m.focus();
				callback_msg = true;
			} catch(e) {
				callback_msg = false;
			}
		break;
		default:
			console.log("unknown state:", message.a);
			callback_msg = false;

	}
	self.port.emit("cb_"+message.a, callback_msg);
});