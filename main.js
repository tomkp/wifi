const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const wifi = require('./wifi');
let mainWindow;

function createWindow () {
  mainWindow = new BrowserWindow({width: 200, height: 600});
  mainWindow.loadURL(`file://${__dirname}/index.html`);
  mainWindow.webContents.openDevTools()
  mainWindow.on('closed', function () {
    mainWindow = null
  });
  monitor(mainWindow);
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
});

const monitor = (win) => {
    wifi.on('off', () => {
          win.webContents.send('off', 'off');
        }).on('not-connected', () => {
          win.webContents.send('not-connected', 'not-connected');
        }).on('data', ({rssi, noise, ssid, channel}) => {
          win.webContents.send('data', {rssi, noise, ssid, channel});
        })
};