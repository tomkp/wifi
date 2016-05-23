import React from 'react';
import {render} from 'react-dom';
import electron from 'electron';
const ipc = electron.ipcRenderer;
import './application.scss';
import fraction from "./Colors";


import Graph from './Graph';
import './graph.scss';


const toColor = (value, threshold) => {

    let col = '#eee';
    if (value > threshold) col = fraction(value / 100, 'eeffee', '00ff00');
    else if (value < threshold) col = fraction(value / 100, 'ffeeee', 'ff0000');
    //console.log(`${value} ${threshold} ${col}`)
    return '#' + col
}

const Display = ({status, ssid, rssi, noise, quality}) => {
    if (status === 'not-connected') {
        return (
            <div className="status">
                Not connected
            </div>
        )
    } else if (status === 'off') {
        return (
            <div className="status">
                Wifi off
            </div>
        )
    }
    return (
        <div className="display">
            <Ssid name={ssid}/>
            <Signal value={rssi}/>
            <Noise value={noise}/>
            <Quality value={quality}/>
        </div>
    )
}



const Ssid = ({name}) => <section className="ssid"><span className="value">{name}</span></section>

const Signal = ({value}) => {
    return (
        <section className="signal">
            <span className="label">Signal</span>
            <span className="value">{value}</span>
        </section>
    )
};

const Noise = ({value}) => <section className="noise"><span className="label">Noise</span><span
    className="value">{value}</span></section>
const Quality = ({value}) => <section className="quality" style={{background: toColor(value, 25)}}><span
    className="label">Quality</span><span className="value">{value}</span></section>


const Application = React.createClass({

    getInitialState() {
        return {
            status: '',
            rssi: 0,
            noise: 0,
            quality: 0,
            ssid: 'N/A'
        }
    },

    componentDidMount() {
        console.log(`Application.componentDidMount`)
        ipc.on('data', (event, {rssi, noise, ssid}) => {
            //const data = message.map(({rssi}) => -rssi / 100)
            //console.log({rssi, noise, ssid});
            const quality = Math.abs(noise - rssi);
            this.setState({status: 'connected', ssid, rssi: 100 + rssi, noise: 100 + noise, quality})
        });
        ipc.on('off', () => {
            console.log(`off`);
            this.setState({status: 'off'})
        })
        ipc.on('not-connected', () => {
            console.log(`not-connected`);
            this.setState({status: 'not-connected'})
        })
    },

    componentWillUnmount() {
        console.log(`Application.componentWillUnmount`)
        ipc.off('data');
    },

    render() {
        return <Display status={this.state.status}
                        ssid={this.state.ssid}
                        rssi={this.state.rssi}
                        noise={this.state.noise}
                        quality={this.state.quality}/>
    }
})

render(<Application />, document.getElementById('root'))