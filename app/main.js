'use strict';
var app = require('app');
var scanner = require('portscanner');
var BrowserWindow = require('browser-window');
var Menu = require("menu");
var env = require('./vendor/electron_boilerplate/env_config');
var devHelper = require('./vendor/electron_boilerplate/dev_helper');
var windowStateKeeper = require('./vendor/electron_boilerplate/window_state');

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
    scanner.checkPortStatus(3000, '127.0.0.1', function(err, status) {
      var url = (status == 'open') ? 'https://github.dev' : 'https://obscure-fjord-9578.herokuapp.com';
      mainWindow.webContents.on('did-finish-load', function(event) {
        this.executeJavaScript("s = document.createElement('script');s.setAttribute('src','" + url + "/assets/application.js'); document.head.appendChild(s);");
      });

      mainWindow.loadUrl('https://github.slack.com/ssb');
      var template = [{
          label: "Application",
          submenu: [
              { label: "About Application", selector: "orderFrontStandardAboutPanel:" },
              { type: "separator" },
              { label: "Quit", accelerator: "Command+Q", click: function() { app.quit(); }}
          ]}, {
          label: "Edit",
          submenu: [
              { label: "Undo", accelerator: "Command+Z", selector: "undo:" },
              { label: "Redo", accelerator: "Shift+Command+Z", selector: "redo:" },
              { type: "separator" },
              { label: "Cut", accelerator: "Command+X", selector: "cut:" },
              { label: "Copy", accelerator: "Command+C", selector: "copy:" },
              { label: "Paste", accelerator: "Command+V", selector: "paste:" },
              { label: "Select All", accelerator: "Command+A", selector: "selectAll:" }
          ]}
      ];

      Menu.setApplicationMenu(Menu.buildFromTemplate(template));
    });

    if (env.name === 'development') {
        devHelper.setDevMenu();
        mainWindow.openDevTools();
    }

    mainWindow.on('close', function () {
        mainWindowState.saveState(mainWindow);
    });
});

app.on('window-all-closed', function () {
    app.quit();
});
