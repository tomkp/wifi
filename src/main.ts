import { app, BrowserWindow } from 'electron';
import path from 'path';
import wifi, { start as startWifi, stop as stopWifi } from './wifi';

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string | undefined;
declare const MAIN_WINDOW_VITE_NAME: string;

interface WifiData {
    rssi: number;
    noise: number;
    ssid: string;
    channel: string;
}

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
    mainWindow = new BrowserWindow({
        width: 200,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });

    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    } else {
        mainWindow.loadFile(
            path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
        );
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
    monitor(mainWindow);
}

app.on('ready', () => {
    createWindow();
    startWifi();
});

app.on('window-all-closed', () => {
    stopWifi();
    app.quit();
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
