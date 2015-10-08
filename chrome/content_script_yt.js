/* jshint strict:false */
chrome.runtime.onMessage.addListener(function(message) {
	switch(message.a) {
		case "stop":
			var video = document.querySelector("video");
			if(video) {
				video.pause();
			}
		break;
	}

});