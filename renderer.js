const wifi = require('./wifi')


const queueSize = 100
const queue = []

wifi
    .on('off', () => {
        console.log(`off`);
    })
    .on('not-connected', () => {
        console.log(`not-connected`);
    })
    .on('data', ({rssi, noise, ssid}) => {
        console.clear()
        console.log(`data ${rssi}, ${noise}, ${ssid}`);
        if (queue.length >= queueSize) {
            queue.shift();
        }
        queue.push({rssi, noise, ssid});
    })