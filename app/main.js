'use strict';
var electron = require('electron');
const {
  app,
  BrowserWindow,
  Menu
} = require('electron')

var env = require('./vendor/electron_boilerplate/env_config');
var windowStateKeeper = require('./vendor/electron_boilerplate/window_state');
var menuTemplate = require('./menu_template')(app);
var shell = electron.shell
var path = require('path');
var ipc = electron.ipcMain;
var autoUpdater = electron.autoUpdater;

var mainWindow;
var menu;

// Preserver of the window size and position between app launches.
var mainWindowState = windowStateKeeper('main', {
    width: 1000,
    height: 600
});

app.on('ready', function () {
  mainWindow = new BrowserWindow({
      x: mainWindowState.x,
      y: mainWindowState.y,
      width: mainWindowState.width,
      height: mainWindowState.height,
      "nodeIntegration": false,
      "webPreferences": {
        "preload": path.join(__dirname, 'expose-team-container-window-apis.js')
      }
      });

  app.mainWindow = mainWindow;
  mainWindow.loadURL('file://' + __dirname + '/teams_container.html');

  if (mainWindowState.isMaximized) {
      mainWindow.maximize();
  }

  mainWindow.log = function(text) {
    mainWindow.webContents.executeJavaScript('console.log("' + text + '");');
  }

  mainWindow.log("version: " + app.getVersion());

  /*
  mainWindow.webContents.on('did-finish-load', function(event) {
    this.executeJavaScript("s = document.createElement('script');s.setAttribute('src','localhax://slack-hacks-loader.js'); document.head.appendChild(s);");
  }); */

  mainWindow.webContents.on('new-window', function(e, url) {
    e.preventDefault();
    if (url.indexOf("http") != 0) {
      return;
    }
    shell.openExternal(url);
  });

  mainWindow.webContents.on('will-navigate', (e) => {
    e.preventDefault()
  })
  //mainWindow.loadURL('https://my.slack.com/ssb');

  menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  var versionMenuItem = menu.items[0].submenu.items[1];
  mainWindow.log("hello from the master process");

  var auresponse = function(which, message) {
    return function(arg1) {
      mainWindow.log("au event: " + which);
      mainWindow.log(message);
      mainWindow.log(arg1);
      if (which == "update-available") {
        if (app.naggedAboutUpdateThisBoot != true) {
          mainWindow.webContents.executeJavaScript('window.showUpdateMessage()');
          app.naggedAboutUpdateThisBoot = true
        }
      }
    }
  }

  if (env.name != "development") {
    autoUpdater.setFeedURL("https://slacks-hacks.herokuapp.com/updates?version=" + app.getVersion());
    autoUpdater.on('error', auresponse("error", "update failed"));
    autoUpdater.on('checking-for-update', auresponse("checking-for-update", "looking for update"));
    autoUpdater.on('update-available', auresponse("update-available", "downloading update"));
    autoUpdater.on('update-not-available', auresponse("update-not-available", "latest"));
    autoUpdater.on('update-downloaded', auresponse("update-downloaded", "restart to update"));
    var fourHours = 1000 * 60 * 60 * 4
    var checkForUpdates = function() {
      mainWindow.log("Checking for updates...");
      autoUpdater.checkForUpdates()
    }
    setInterval(checkForUpdates, fourHours)
    checkForUpdates()
  }

  if (env.name === 'development') {
      mainWindow.openDevTools();
  }

  mainWindow.on('close', function () {
      mainWindowState.saveState(mainWindow);
  });

  ipc.on('bounce', function(event, arg) {
    app.dock.bounce(arg.type);
  });

  ipc.on('badge', function(event, arg) {
    app.dock.setBadge(arg.badge_text.toString());
  });

  var httpHandler = function(protocol) {
    return function(request, callback) {
      var url = request.url.split("://", 2)[1]
      url = protocol + "://" + url
      return callback( {url: url} );
    }
  }

  electron.protocol.registerHttpProtocol('haxs', httpHandler("https"))
  electron.protocol.registerHttpProtocol('hax', httpHandler("http"))

  electron.protocol.registerFileProtocol('localhax', function(request, callback) {
    var url = request.url.split("://", 2)[1]
    callback({path: path.normalize(__dirname + '/localhax/' + url)});
  });
});

app.on('window-all-closed', function () {
    app.quit();
});

app.on('check-update', function() {
  console.log("I would check");
});

require('./zoom_menu')(app);
require('./history_menu')(app);
