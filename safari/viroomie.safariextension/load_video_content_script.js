/* jshint strict:false */


if (window.top === window) {
	function handleMessage(message) {
		var callback_msg;
		switch(message.a) {
			case "state":
				callback_msg = "to-do";

			break;
			case "url":
				try {
					var m = document.getElementById("m");
					m.value = "/video "+message.url;
					var b = document.getElementById("send");
					if(b.click) {
						b.click();
					}
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
		safari.self.tab.dispatchMessage("cb_"+message.a,callback_msg);
	}
	safari.self.addEventListener("message", handleMessage, false);
}