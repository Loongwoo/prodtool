const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

const createWindow = () => {
  const mainWindow = new BrowserWindow({ width: 1080, height: 700 });

  mainWindow.loadURL('https://prodtool.kiwiot.com/serial-tool');
  // mainWindow.webContents.openDevTools();

  const modal = new BrowserWindow({
    parent: mainWindow,
    width: 400,
    height: 600,
    modal: true,
    show: false,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'modal/preload.js'),
    },
  });

  modal.webContents.session.setPermissionCheckHandler(
    (webContents, permission, requestingOrigin, details) => permission === 'serial'
  );

  modal.webContents.session.setDevicePermissionHandler(details => details.deviceType === 'serial');

  modal.webContents.session.on('select-serial-port', (event, portList, webContents, callback) => {
    modal.webContents.session.on('serial-port-added', (_event, port) => {
      console.log('serial-port-added', port);
    });
    modal.webContents.session.on('serial-port-removed', (_event, port) => {
      console.log('serial-port-removed', port);
    });
    // modal.webContents.openDevTools();
    modal.webContents.send('update-list', portList);
    modal.show();

    event.preventDefault();
    ipcMain.once('serial-port', (_event, portId = '') => {
      callback(portId);
      modal.hide();
    });
  });

  modal.loadFile('./modal/index.html');
};

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
