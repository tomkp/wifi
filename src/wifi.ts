import { spawn } from 'child_process';
import split from 'split';
import { EventEmitter } from 'events';

const airport =
    '/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport';

interface ParsedLine {
    key: string;
    value: string;
}

interface RawWifiData {
    AirPort?: string;
    SSID?: string;
    agrCtlRSSI?: string;
    agrCtlNoise?: string;
    channel?: string;
    [key: string]: string | undefined;
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

type WifiResult = WifiOffResult | WifiNotConnectedResult | WifiConnectedResult;

const events = new EventEmitter();

export const parseLine = (line: string): ParsedLine | null => {
    const info = line.trim().split(': ');
    if (info.length === 2) {
        return { key: info[0], value: info[1] };
    }
    return null;
};

export const parseWifiData = (data: RawWifiData): WifiResult => {
    if (data.AirPort === 'Off') {
        return { status: 'off' };
    }
    if (!data.SSID) {
        return { status: 'not-connected' };
    }
    const rssi = Number(data.agrCtlRSSI);
    const noise = Number(data.agrCtlNoise);
    const channel = data.channel ?? '';
    return {
        status: 'connected',
        rssi,
        noise,
        channel,
        ssid: data.SSID
    };
};

const poll = (): void => {
    const data: RawWifiData = {};

    spawn(airport, ['-I'])
        .stdout.pipe(split())
        .on('data', (line: string) => {
            const parsed = parseLine(line);
            if (parsed) {
                data[parsed.key] = parsed.value;
            }
        })
        .on('end', () => {
            const result = parseWifiData(data);
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

export const start = (interval = 20): EventEmitter => {
    if (!intervalId) {
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

// Auto-start for backward compatibility when run directly
if (require.main === module || process.env.NODE_ENV !== 'test') {
    start();
}

export default events;
