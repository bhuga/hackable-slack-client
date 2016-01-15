var hostProcess = process;
var hostRequire = require;

process.once('loaded', function(){

  global.host = {};

  global.host.ipc = hostRequire('electron').ipcRenderer;
  webFrame = hostRequire('electron').webFrame;
  webFrame.registerURLSchemeAsBypassingCSP("hax")
  webFrame.registerURLSchemeAsBypassingCSP("haxs")
  webFrame.registerURLSchemeAsBypassingCSP("localhax")
  webFrame.registerURLSchemeAsSecure("hax")
  webFrame.registerURLSchemeAsSecure("haxs")
  webFrame.registerURLSchemeAsSecure("localhax")

  global.host.zoom = {

    localStorageKey: "default-zoom",

    setZoom: function(zoom) {
      webFrame.setZoomFactor(zoom);
      localStorage.setItem(global.host.zoom.localStorageKey, zoom);
    },

    increase: function() {
      zoom = webFrame.getZoomFactor();
      global.host.zoom.setZoom(zoom + 0.1);
    },

    decrease: function() {
      zoom = webFrame.getZoomFactor();
      global.host.zoom.setZoom(zoom - 0.1);
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
