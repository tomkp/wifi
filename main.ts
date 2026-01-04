import { app, BrowserWindow } from 'electron';
import path from 'path';
import wifi from './wifi';

interface WifiData {
    rssi: number;
    noise: number;
    ssid: string;
    channel: string;
}

let mainWindow: BrowserWindow | null = null;

const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;

function createWindow(): void {
    mainWindow = new BrowserWindow({
        width: 200,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    if (VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(VITE_DEV_SERVER_URL);
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
    monitor(mainWindow);
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

const monitor = (win: BrowserWindow): void => {
    wifi.on('off', () => {
        if (mainWindow) win.webContents.send('off', 'off');
    })
        .on('not-connected', () => {
            if (mainWindow) win.webContents.send('not-connected', 'not-connected');
        })
        .on('data', ({ rssi, noise, ssid, channel }: WifiData) => {
            if (mainWindow) win.webContents.send('data', { rssi, noise, ssid, channel });
        });
};
