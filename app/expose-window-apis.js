var hostProcess = process;
var hostRequire = require;

process.once('loaded', function(){

  global.host = {};

  global.host.ipc = hostRequire('electron').ipcRenderer;
  global.host.webFrame = hostRequire('electron').webFrame;

  global.host.zoom = {

    localStorageKey: "default-zoom",

    setZoom: function(zoom) {
      global.host.webFrame.setZoomFactor(zoom);
      localStorage.setItem(global.host.zoom.localStorageKey, zoom);
    },

    increase: function() {
      zoom = global.host.webFrame.getZoomFactor();
      global.host.zoom.setZoom(zoom + 0.2);
    },

    decrease: function() {
      zoom = global.host.webFrame.getZoomFactor();
      global.host.zoom.setZoom(zoom - 0.2);
    },

    reset: function() {
      global.host.zoom.setZoom(1);
    }
  }

  var defaultZoom = localStorage.getItem(global.host.zoom.localStorageKey);
  if (defaultZoom != null) {
    // set the default zoom that we saved previously
    global.host.zoom.setZoom(parseFloat(defaultZoom));
  }
});
