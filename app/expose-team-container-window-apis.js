var hostProcess = process;
var hostRequire = require;

process.once('loaded', function(){
  electron = hostRequire('electron')

  global.host = {};

  ipc = electron.ipcRenderer;

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
      console.log("setting sub zoom to " + zoom);
      if (isNaN(zoom)) {
        zoom = 1.0
      }
      if (typeof window.getCurrentTeamWebview === "function") {
        window.getCurrentTeamWebview().executeJavaScript("host.zoom.setZoom(" + zoom + ")");
      //webFrame.setZoomFactor(zoom);
        localStorage.setItem(global.host.zoom.localStorageKey, zoom);
      }
    },

    increase: function() {
      zoom = parseFloat(localStorage.getItem(global.host.zoom.localStorageKey));
      console.log("parsed zoom is " + zoom);
      global.host.zoom.setZoom(zoom + 0.1);
    },

    decrease: function() {
      zoom = parseFloat(localStorage.getItem(global.host.zoom.localStorageKey));
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

  //TS.client.ui.active_highlight_count
  //TS.model.prefs.mac_ssb_bounce, "short" or "long"
  global.dock = {
    bounce: function() {
      var preference, type;
      preference = TS.model.prefs.mac_ssb_bounce;
      if (!(preference === "long" || preference === "short")) {
        return;
      }
      type = TS.model.prefs.mac_ssb_bounce === "short" ? "informational" : "critical";
      return ipc.send('bounce', {
        type: type
      });
    },

    badge: function(message) {
      return ipc.send('badge', {
        badge_text: message
      });
    }
  };

  global.reportLogin = function() {
    var team_name = TS.boot_data.team_url.match(/https:\/\/([^\.]+).slack.com/)[1]
    var icon_url
    if (TS.model.team.icon != null && TS.model.team.icon != "undefined") {
      icon_url = TS.model.team.icon.image_34
    } else {
      setTimeout(function() { window.reportLogin() }, 3000 );
    }
    ipc.sendToHost('login', {
      icon_url: icon_url,
      team_name: team_name
    });
  }

  global.host.openDevToolsForActiveTeam = function() {
    $('.current webview').openDevTools()
  }

  global.ipc = ipc;
});
