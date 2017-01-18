var hostProcess = process;
var hostRequire = require;

process.once('loaded', function(){
  electron = hostRequire('electron')
  shell = hostRequire('shell')
  electron.remote.getCurrentWindow().removeAllListeners()
  electron.remote.getCurrentWebContents().on('new-window', function(e, url) {
    if (url.indexOf("https://slack.com/signin") == 0) {
      window.location = url
      return
    }
    console.log("new window event for " + url);
    e.preventDefault();
    if (url.indexOf("http") != 0) {
      return;
    }
    shell.openExternal(url);
  });

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

  //TS.client.ui.active_highlight_count
  //TS.model.prefs.mac_ssb_bounce, "short" or "long"
  global.dock = {
    bounce: function() {
      var preference, type;
      var team_name = TS.boot_data.team_url.match(/https:\/\/([^\.]+).slack.com/)[1]
      preference = TS.model.prefs.mac_ssb_bounce;
      if (!(preference === "long" || preference === "short")) {
        return;
      }
      type = TS.model.prefs.mac_ssb_bounce === "short" ? "informational" : "critical";
      return ipc.sendToHost('team-bounce', {
        type: type,
        team_name: team_name
      });
    },

    badge: function(message) {
      var team_name = TS.boot_data.team_url.match(/https:\/\/([^\.]+).slack.com/)[1]
      return ipc.sendToHost('team-badge', {
        badge_text: message,
        team_name: team_name
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

  const Menu = electron.remote.Menu;
  const MenuItem = electron.remote.MenuItem;
  const Clipboard = electron.remote.clipboard;

  var rightClickPosition, rightClickElement = null

  var copyLinkLocation = new MenuItem({ label: "Copy Link Location", click: function() {
    Clipboard.writeText(rightClickElement.href)
  }});
  var inspectElement = new MenuItem({ label: 'Inspect Element', click: function() {
    electron.remote.getCurrentWebContents().inspectElement(rightClickPosition.x, rightClickPosition.y);
  }});
  var inspectParentElement = new MenuItem({ label: 'Inspect Parent Element', click: function() {
    electron.remote.getCurrentWindow().inspectElement(rightClickPosition.x, rightClickPosition.y)
  }});
  var separator = new MenuItem({ type: 'separator' });
  var react = new MenuItem({ label: 'React!', click: function() {
    electron.remote.getCurrentWebContents().executeJavaScript("TS.menu.emoji.start({e: next_react_msg, rxn_key: next_rxn_key})");
  }});

  var regularMenu = new Menu();
  var linkMenu = new Menu();
  var msgMenu = new Menu();
  var msgLinkMenu = new Menu();

  regularMenu.append(inspectElement)
  regularMenu.append(separator)
  regularMenu.append(inspectParentElement)

  linkMenu.append(inspectElement)
  linkMenu.append(copyLinkLocation)
  linkMenu.append(separator)
  linkMenu.append(inspectParentElement)

  msgMenu.append(react)
  msgMenu.append(inspectElement)
  msgMenu.append(separator)
  msgMenu.append(inspectParentElement)

  msgLinkMenu.append(react)
  msgLinkMenu.append(inspectElement)
  msgLinkMenu.append(copyLinkLocation)
  msgLinkMenu.append(separator)
  msgLinkMenu.append(inspectParentElement)

  window.addEventListener('contextmenu', function (e) {
    e.preventDefault();
    rightClickPosition = {x: e.x, y: e.y}
    rightClickElement = e.srcElement || e.target;

    var href = rightClickElement.href

    // it was like this when i copied it from rollup-secondary-a. i apologize.
    var msg_el = $(e.target).closest("ts-message")
    if (msg_el.size() == 0) {
      return regularMenu.popup(electron.remote.getCurrentWindow());
    }
    var msg_ts = msg_el.data("ts");
    var model_ob_id = msg_el.data("model-ob-id");
    var model_ob = model_ob_id ? TS.shared.getModelObById(model_ob_id) : TS.shared.getActiveModelOb();
    var msg = TS.utility.msgs.getMsg(msg_ts, model_ob.msgs);

    if (msg === null) {
      if (typeof href == "string") {
        linkMenu.popup(electron.remote.getCurrentWindow());
      } else {
        regularMenu.popup(electron.remote.getCurrentWindow());
      }
    } else {
      window.next_react_msg = msg
      window.next_rxn_key = TS.rxns.getRxnKeyByMsgType(msg);
      if (typeof href == "string") {
        msgLinkMenu.popup(electron.remote.getCurrentWindow());
      } else {
        msgMenu.popup(electron.remote.getCurrentWindow());
      }
    }
  }, false);

  window.okayToNavigate = function() {
    // from rollup_client _navigateHistoryUsingKeys
    var input_is_empty = TS.utility.contenteditable.value(document.activeElement) === "";
    return (TS.utility.isFocusOnInput() && (input_is_empty || !input_must_be_empty) || document.activeElement == document.body)
  }

  window.historyBack = function() {
    if (okayToNavigate()) {
      window.history.go(-1)
    }
  }

  window.historyForward = function() {
    if (okayToNavigate()) {
      window.history.go(1)
    }
  }
});
