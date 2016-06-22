const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const wifi = require('./wifi');
let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({width: 200, height: 600});
    mainWindow.loadURL(`file://${__dirname}/index.html`);
    //mainWindow.webContents.openDevTools()
    mainWindow.on('closed', function () {
        //wifi.off('off').off('not-connected').off('data');
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
        if (mainWindow)
            win.webContents.send('off', 'off');
    }).on('not-connected', () => {
        if (mainWindow)
            win.webContents.send('not-connected', 'not-connected');
    }).on('data', ({rssi, noise, ssid, channel}) => {
        if (mainWindow)
            win.webContents.send('data', {rssi, noise, ssid, channel});
    })
};