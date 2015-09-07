// frame_url appears to REQUIRE a subdomain... or else window.history will not be available, and GA will die in the iframe. Some sort of weird bug in the addon SDK.
var GaProxy = function(frame_url) {
  this.loading = false;
  this.loaded = false;
  this.iframe = null;
  this.queue = [];
  this.frame_url = frame_url;
  
  this.makeFrame =  function() {
    if (this.loading || this.loaded) {
      return false;
    }
    this.loading = true;
    this.iframe = $("<iframe>", {name: "xdcom_frame", style: "position: absolute; top: 0; left: 0; width: 1px; height: 1px; visibility: hidden; background: #fff;"});
    $("body").append(this.iframe);
    this.iframe.on("load", function(e) {
      this.loaded = true;
      this.loading = false;
      this.processQueue();
    }.bind(this));
    this.iframe.attr("src", this.frame_url);
  };
  
  this.push = function() {
    this.makeFrame();
    this.queue.push(arguments);
    this.processQueue();
  };
  
  this.processQueue = function() {
    if (this.loaded) {
      var data = JSON.stringify(this.queue);
      window.frames["xdcom_frame"].postMessage(data, this.frame_url);
      this.queue = [];
    }
  };

};
