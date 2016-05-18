const wifi = require('./wifi')

wifi
    .on('off', () => {
        console.log(`off`);
    })
    .on('not-connected', () => {
        console.log(`not-connected`);
    })
    .on('data', ({rssi, noise, ssid}) => {
        console.log(`data ${rssi}, ${noise}, ${ssid}`);
    })