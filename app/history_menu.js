'use strict';
module.exports = function(app) {
  app.on('history.back', function(event, arg) {
    app.mainWindow.webContents.executeJavaScript("console.log('history backward!');")
  });

  app.on('history.forward', function(event, arg) {
    app.mainWindow.webContents.executeJavaScript("console.log('history forward!');")
  });
}
