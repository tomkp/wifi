const spawn = require('child_process').spawn
const split = require('split')
const airport = '/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport'
const EventEmitter = require('events').EventEmitter;
const events = new EventEmitter();

const poll = () => {

    let data = {}

    spawn(airport, ['-I'])
        .stdout
        .pipe(split())
        .on('data', function (line) {
            const info = line.trim().split(': ')
            if (info.length === 2) {
                data[info[0]] = info[1]
            }
        })
        .on('end', function () {
            console.log(`data: ${JSON.stringify(data)}`);
            if (data.AirPort === 'Off') {
                events.emit('off')
                return
            }
            if (!data.SSID) {
                events.emit('not-connected')
                return
            }
            const rssi = Number(data.agrCtlRSSI)
            const noise = Number(data.agrCtlNoise)
            const channel = data.channel
            events.emit('data', {rssi, noise, channel, ssid: data.SSID})
        })
}


setInterval(() => {
    poll();
}, 1000);


module.exports = events