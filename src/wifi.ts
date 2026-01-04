import { exec } from 'child_process';
import { EventEmitter } from 'events';

interface AirPortInterface {
    _name: string;
    spairport_status_information?: string;
    spairport_current_network_information?: {
        _name: string;
        spairport_signal_noise: string;
        spairport_network_channel: string;
    };
}

interface SystemProfilerData {
    SPAirPortDataType?: Array<{
        spairport_airport_interfaces?: AirPortInterface[];
    }>;
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

export const parseSignalNoise = (signalNoise: string): { rssi: number; noise: number } => {
    const match = signalNoise.match(/(-?\d+)\s*dBm\s*\/\s*(-?\d+)\s*dBm/);
    if (match) {
        return {
            rssi: parseInt(match[1], 10),
            noise: parseInt(match[2], 10)
        };
    }
    return { rssi: 0, noise: 0 };
};

export const parseChannel = (channel: string): string => {
    const match = channel.match(/^(\d+)/);
    return match ? match[1] : '';
};

export const parseSystemProfilerData = (data: SystemProfilerData): WifiResult => {
    const airports = data.SPAirPortDataType?.[0]?.spairport_airport_interfaces;
    if (!airports || airports.length === 0) {
        return { status: 'off' };
    }

    const wifiInterface = airports.find((iface) => iface._name === 'en0');
    if (!wifiInterface) {
        return { status: 'off' };
    }

    const status = wifiInterface.spairport_status_information;
    if (status === 'spairport_status_off') {
        return { status: 'off' };
    }

    const currentNetwork = wifiInterface.spairport_current_network_information;
    if (!currentNetwork) {
        return { status: 'not-connected' };
    }

    const { rssi, noise } = parseSignalNoise(currentNetwork.spairport_signal_noise);
    const channel = parseChannel(currentNetwork.spairport_network_channel);

    return {
        status: 'connected',
        ssid: currentNetwork._name,
        rssi,
        noise,
        channel
    };
};

const poll = (): void => {
    exec('system_profiler SPAirPortDataType -json', (error, stdout) => {
        if (error) {
            events.emit('error', error);
            return;
        }

        try {
            const data: SystemProfilerData = JSON.parse(stdout);
            const result = parseSystemProfilerData(data);

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
        } catch {
            events.emit('error', new Error('Failed to parse system_profiler output'));
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
