const spawn = require('child_process').spawn;
const split = require('split');
const airport = '/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport';
const EventEmitter = require('events').EventEmitter;
const events = new EventEmitter();

const parseLine = (line) => {
    const info = line.trim().split(': ');
    if (info.length === 2) {
        return { key: info[0], value: info[1] };
    }
    return null;
};

const parseWifiData = (data) => {
    if (data.AirPort === 'Off') {
        return { status: 'off' };
    }
    if (!data.SSID) {
        return { status: 'not-connected' };
    }
    const rssi = Number(data.agrCtlRSSI);
    const noise = Number(data.agrCtlNoise);
    const channel = data.channel;
    return {
        status: 'connected',
        rssi,
        noise,
        channel,
        ssid: data.SSID
    };
};

const poll = () => {
    let data = {};

    spawn(airport, ['-I'])
        .stdout
        .pipe(split())
        .on('data', function (line) {
            const parsed = parseLine(line);
            if (parsed) {
                data[parsed.key] = parsed.value;
            }
        })
        .on('end', function () {
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


let intervalId = null;

const start = (interval = 20) => {
    if (!intervalId) {
        intervalId = setInterval(() => {
            poll();
        }, interval);
    }
    return events;
};

const stop = () => {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
};

// Auto-start for backward compatibility when run directly
if (require.main === module || process.env.NODE_ENV !== 'test') {
    start();
}

module.exports = events;
module.exports.parseLine = parseLine;
module.exports.parseWifiData = parseWifiData;
module.exports.start = start;
module.exports.stop = stop;