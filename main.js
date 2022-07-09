const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

const kOrigin = 'https://prodtool.kiwiot.com';

const createWindow = () => {
  const mainWindow = new BrowserWindow({ width: 1080, height: 700 });

  mainWindow.loadURL(`${kOrigin}/serial-tool`);

  mainWindow.webContents.session.on('select-serial-port', (event, portList, webContents, callback) => {
    event.preventDefault();

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
    modal.loadFile('./modal/index.html');
    modal.once('ready-to-show', () => {
      modal.webContents.send('update-list', portList);
      modal.show();
    });

    // modal.webContents.openDevTools();

    ipcMain.once('serial-port', (_event, portId = '') => {
      callback(portId);
      modal.close();
    });
  });

  // mainWindow.webContents.session.on('serial-port-added', (event, port) => {
  //   console.log('serial-port-added FIRED WITH', port);
  // });

  // mainWindow.webContents.session.on('serial-port-removed', (event, port) => {
  //   console.log('serial-port-removed FIRED WITH', port);
  // });

  mainWindow.webContents.session.setPermissionCheckHandler(
    (webContents, permission, requestingOrigin, details) => {
      if (permission === 'serial' && details.securityOrigin === `${kOrigin}/`) {
        return true;
      }
    }
  );

  mainWindow.webContents.session.setDevicePermissionHandler(details => {
    if (details.deviceType === 'serial' && details.origin === kOrigin) {
      return true;
    }
  });

  // 打开开发工具
  // mainWindow.webContents.openDevTools();
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
