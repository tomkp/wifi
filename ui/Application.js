import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import electron from 'electron';
import './application.scss';
import fraction from './Colors';
import Graph from './Graph';
import './graph.scss';

const ipc = electron.ipcRenderer;

const toColor = (value, threshold) => {
    let col = '#eee';
    if (value > threshold) col = fraction(value / 100, 'eeffee', '00ff00');
    else if (value < threshold) col = fraction(value / 100, 'ffeeee', 'ff0000');
    return '#' + col;
};

const Ssid = ({ name, channel }) => {
    return (
        <section className="ssid">
            <span className="value">{name}</span>
            <span className="label">Channel {channel}</span>
        </section>
    );
};

const Signal = ({ value }) => {
    return (
        <section className="signal">
            <span className="label">Signal</span>
            <span className="value">{value}</span>
        </section>
    );
};

const Noise = ({ value }) => {
    return (
        <section className="noise">
            <span className="label">Noise</span>
            <span className="value">{value}</span>
        </section>
    );
};

const Quality = ({ value }) => {
    return (
        <section className="quality" style={{ background: toColor(value, 25) }}>
            <span className="label">Quality</span>
            <span className="value">{value}</span>
        </section>
    );
};

const QualityGraph = ({ value }) => {
    const [values, setValues] = useState(() => Array(200).fill(0));
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

const Display = ({ status, ssid, rssi, noise, quality, channel }) => {
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
    const [state, setState] = useState({
        status: '',
        rssi: 0,
        noise: 0,
        quality: 0,
        channel: '',
        ssid: 'N/A'
    });

    useEffect(() => {
        console.log('Application mounted');

        const handleData = (_event, { rssi, noise, ssid, channel }) => {
            const quality = Math.abs(noise - rssi);
            setState({
                status: 'connected',
                ssid,
                rssi: 100 + rssi,
                noise: 100 + noise,
                quality,
                channel
            });
        };

        const handleOff = () => {
            console.log('off');
            setState((prev) => ({ ...prev, status: 'off' }));
        };

        const handleNotConnected = () => {
            console.log('not-connected');
            setState((prev) => ({ ...prev, status: 'not-connected' }));
        };

        ipc.on('data', handleData);
        ipc.on('off', handleOff);
        ipc.on('not-connected', handleNotConnected);

        return () => {
            console.log('Application unmounting');
            ipc.off('data', handleData);
            ipc.off('off', handleOff);
            ipc.off('not-connected', handleNotConnected);
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
const root = createRoot(container);
root.render(<Application />);
