import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
    onData: (
        callback: (data: { rssi: number; noise: number; ssid: string; channel: string }) => void
    ) => {
        ipcRenderer.on('data', (_event, data) => callback(data));
    },
    onOff: (callback: () => void) => {
        ipcRenderer.on('off', () => callback());
    },
    onNotConnected: (callback: () => void) => {
        ipcRenderer.on('not-connected', () => callback());
    },
    removeAllListeners: () => {
        ipcRenderer.removeAllListeners('data');
        ipcRenderer.removeAllListeners('off');
        ipcRenderer.removeAllListeners('not-connected');
    }
});
