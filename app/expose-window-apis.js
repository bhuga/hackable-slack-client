var hostProcess = process;
var hostRequire = require;

process.once('loaded', function(){

  global.host = {};

  global.host.ipc = hostRequire('electron').ipcRenderer;
});
