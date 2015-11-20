'use strict';
var app = require('app');
var BrowserWindow = require('browser-window');
var Menu = require("menu");
var env = require('./vendor/electron_boilerplate/env_config');
var menuTemplate = require('./menu_template')(app);
var windowStateKeeper = require('./vendor/electron_boilerplate/window_state');
var shell = require('shell');

var mainWindow;

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
        "node-integration": false,
        "web-preferences": {
          "web-security": false
        }
        });

    if (mainWindowState.isMaximized) {
        mainWindow.maximize();
    }
    mainWindow.webContents.on('did-finish-load', function(event) {
      this.executeJavaScript("s = document.createElement('script');s.setAttribute('src','https://dinosaur.s3.amazonaws.com/slack-hacks-loader.js'); document.head.appendChild(s);");
    });

    mainWindow.webContents.on('new-window', function(e, url) {
      e.preventDefault();
      shell.openExternal(url);
    });

    mainWindow.webContents.on('will-navigate', function(event) {
      // This allows drag and drop to work
      console.log("preventing will-navigate");
      event.preventDefault();
    });

    mainWindow.loadURL('https://my.slack.com/ssb');

    //console.log(menuTemplate);
    var built = Menu.buildFromTemplate(menuTemplate);
    console.log(built);
    var res = Menu.setApplicationMenu(built);
    console.log("menu set result");
    console.log(res);

    if (env.name === 'development') {
        mainWindow.openDevTools();
    }

    mainWindow.on('close', function () {
        mainWindowState.saveState(mainWindow);
    });
    mainWindow.on('page-title-updated', function(event) {
      var title = mainWindow.webContents.getTitle();
      console.log("title changed to: " + title);
      if (title.indexOf("!") != -1) {
        console.log("bouncing");
        app.bounce_id = app.dock.bounce("critical");
        app.dock.setBadge("*");
      } else {
        console.log("canceling bounce");
        if (app.bounce_id !== undefined && app.bounce_id !== null) {
          app.dock.cancelBounce(app.bounce_id);
          app.dock.setBadge("");
        }
      }
    });

});

app.on('window-all-closed', function () {
    app.quit();
});
