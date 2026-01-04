import { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import 'normalize.css';
import './application.css';
import fraction from './Colors';
import Graph from './Graph';
import './graph.css';

type WifiStatus = 'connected' | 'off' | 'not-connected' | '';

interface WifiData {
    rssi: number;
    noise: number;
    ssid: string;
    channel: string;
}

interface AppState {
    status: WifiStatus;
    rssi: number;
    noise: number;
    quality: number;
    channel: string;
    ssid: string;
}

interface ElectronAPI {
    onData: (callback: (data: WifiData) => void) => void;
    onOff: (callback: () => void) => void;
    onNotConnected: (callback: () => void) => void;
    removeAllListeners: () => void;
}

declare global {
    interface Window {
        electronAPI: ElectronAPI;
    }
}

const toColor = (value: number, threshold: number): string => {
    let col = '#eee';
    if (value > threshold) col = fraction(value / 100, 'eeffee', '00ff00');
    else if (value < threshold) col = fraction(value / 100, 'ffeeee', 'ff0000');
    return '#' + col;
};

interface SsidProps {
    name: string;
    channel: string;
}

const Ssid = ({ name, channel }: SsidProps) => {
    return (
        <section className="ssid">
            <span className="value">{name}</span>
            <span className="label">Channel {channel}</span>
        </section>
    );
};

interface ValueProps {
    value: number;
}

const Signal = ({ value }: ValueProps) => {
    return (
        <section className="signal">
            <span className="label">Signal</span>
            <span className="value">
                {value}<span className="max">/100</span>
            </span>
        </section>
    );
};

const Noise = ({ value }: ValueProps) => {
    return (
        <section className="noise">
            <span className="label">Noise</span>
            <span className="value">
                {value}<span className="max">/100</span>
            </span>
        </section>
    );
};

const Quality = ({ value }: ValueProps) => {
    return (
        <section className="quality" style={{ background: toColor(value, 25) }}>
            <span className="label">Quality</span>
            <span className="value">
                {value}<span className="max">/100 dB</span>
            </span>
        </section>
    );
};

const QualityGraph = ({ value }: ValueProps) => {
    const [values, setValues] = useState<number[]>(() => Array(200).fill(0));
    const prevValueRef = useRef(value);

    useEffect(() => {
        if (prevValueRef.current !== value) {
            setValues((prev) => [...prev.slice(1), value]);
            prevValueRef.current = value;
        }
    }, [value]);

    return (
        <section className="quality-graph" style={{ background: toColor(value, 25) }}>
            <Graph data={values} />
        </section>
    );
};

interface DisplayProps {
    status: WifiStatus;
    ssid: string;
    rssi: number;
    noise: number;
    quality: number;
    channel: string;
}

const Display = ({ status, ssid, rssi, noise, quality, channel }: DisplayProps) => {
    if (status === 'not-connected') {
        return <div className="status">Not connected</div>;
    } else if (status === 'off') {
        return <div className="status">Wifi off</div>;
    }
    return (
        <div className="display">
            <Ssid name={ssid} channel={channel} />
            <div className="values">
                <Signal value={rssi} />
                <Noise value={noise} />
            </div>
            <div className="qualities">
                <Quality value={quality} />
                <QualityGraph value={quality} />
            </div>
        </div>
    );
};

const Application = () => {
    const [state, setState] = useState<AppState>({
        status: '',
        rssi: 0,
        noise: 0,
        quality: 0,
        channel: '',
        ssid: 'N/A'
    });

    useEffect(() => {
        console.log('Application mounted');

        window.electronAPI.onData(({ rssi, noise, ssid, channel }) => {
            const quality = Math.abs(noise - rssi);
            setState({
                status: 'connected',
                ssid,
                rssi: 100 + rssi,
                noise: 100 + noise,
                quality,
                channel
            });
        });

        window.electronAPI.onOff(() => {
            console.log('off');
            setState((prev) => ({ ...prev, status: 'off' }));
        });

        window.electronAPI.onNotConnected(() => {
            console.log('not-connected');
            setState((prev) => ({ ...prev, status: 'not-connected' }));
        });

        return () => {
            console.log('Application unmounting');
            window.electronAPI.removeAllListeners();
        };
    }, []);

    return (
        <Display
            status={state.status}
            ssid={state.ssid}
            rssi={state.rssi}
            noise={state.noise}
            channel={state.channel}
            quality={state.quality}
        />
    );
};

const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(<Application />);
}
