import { exec } from 'child_process';
import { EventEmitter } from 'events';
import path from 'path';

interface WifiHelperResult {
    status: 'off' | 'not-connected' | 'connected';
    ssid?: string;
    rssi?: number;
    noise?: number;
    channel?: number;
    error?: string;
}

interface WifiOffResult {
    status: 'off';
}

interface WifiNotConnectedResult {
    status: 'not-connected';
}

interface WifiConnectedResult {
    status: 'connected';
    rssi: number;
    noise: number;
    channel: string;
    ssid: string;
}

export type WifiResult = WifiOffResult | WifiNotConnectedResult | WifiConnectedResult;

const events = new EventEmitter();

export const parseWifiHelperOutput = (output: string): WifiResult => {
    try {
        const data: WifiHelperResult = JSON.parse(output);

        if (data.error || data.status === 'off') {
            return { status: 'off' };
        }

        if (data.status === 'not-connected') {
            return { status: 'not-connected' };
        }

        return {
            status: 'connected',
            ssid: data.ssid ?? '',
            rssi: data.rssi ?? 0,
            noise: data.noise ?? 0,
            channel: String(data.channel ?? '')
        };
    } catch {
        return { status: 'off' };
    }
};

const getHelperPath = (): string => {
    // In development, use the resources folder
    // In production (packaged), it will be in the app's resources
    const isDev = process.env.NODE_ENV === 'development' || !process.resourcesPath;
    if (isDev) {
        return path.join(__dirname, '..', 'resources', 'wifi-info');
    }
    return path.join(process.resourcesPath, 'wifi-info');
};

const poll = (): void => {
    const helperPath = getHelperPath();

    exec(`"${helperPath}"`, (error, stdout) => {
        if (error) {
            events.emit('error', error);
            return;
        }

        const result = parseWifiHelperOutput(stdout);

        if (result.status === 'off') {
            events.emit('off');
        } else if (result.status === 'not-connected') {
            events.emit('not-connected');
        } else {
            events.emit('data', {
                rssi: result.rssi,
                noise: result.noise,
                channel: result.channel,
                ssid: result.ssid
            });
        }
    });
};

let intervalId: ReturnType<typeof setInterval> | null = null;

export const start = (interval = 2000): EventEmitter => {
    if (!intervalId) {
        poll();
        intervalId = setInterval(() => {
            poll();
        }, interval);
    }
    return events;
};

export const stop = (): void => {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
};

export default events;
