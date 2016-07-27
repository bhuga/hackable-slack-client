'use strict';
module.exports = function(app) {
  app.on('zoom-in', function(event, arg) {
    app.mainWindow.webContents.executeJavaScript("host.zoom.increase();")
  });

  app.on('zoom-out', function(event, arg) {
    app.mainWindow.webContents.executeJavaScript("host.zoom.decrease();")
  });

  app.on('reset-zoom', function(event, arg) {
    app.mainWindow.webContents.executeJavaScript("host.zoom.reset();")
  });
}
