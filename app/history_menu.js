'use strict';
module.exports = function(app) {
  app.on('history.back', function(event, arg) {
    app.mainWindow.webContents.executeJavaScript("getCurrentTeamWebview().executeJavaScript('window.historyBack()')")
  });

  app.on('history.forward', function(event, arg) {
    app.mainWindow.webContents.executeJavaScript("getCurrentTeamWebview().executeJavaScript('window.historyForward()')")
  });
}
