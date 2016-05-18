const spawn = require('child_process').spawn
const split = require('split')
const airport = '/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport'
const EventEmitter = require('events').EventEmitter;
const events = new EventEmitter();





function start() {
    
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
            const rssi = Number(data.agrCtlRSSI)
            const noise = Number(data.agrCtlNoise)
            if (!data.SSID) {
                events.emit('not-connected')
                return
            }
            events.emit('data', {rssi, noise, ssid: SSID})
        })
}

start();






events
    .on('off', () => {
        console.log(`off`);
    })
    .on('not-connected', () => {
        console.log(`not-connected`);
    })
    .on('data', ({rssi, noise, ssid}) => {
        console.log(`data ${rssi}, ${noise}, ${ssid}`);
    })