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
    // const style = {
    //     background: '#' + col
    // };
    console.log(`${value} ${threshold} ${col}`)
    return '#' + col
}

const Display = ({rssi, noise, ssid}) => {
    const snr = Math.abs(noise - rssi);
    return (
        <div className="display">
            <Ssid name={ssid} />
            <Signal value={100 + rssi} />
            <Noise value={100 + noise} />
            <Snr value={snr} />
        </div>
    )
}

const Ssid = ({name}) => <section className="ssid"><span className="value">{name}</span></section>
const Signal = ({value}) => <section className="signal"><span className="label">Signal</span><span className="value">{value}</span></section>
const Noise = ({value}) => <section className="noise"><span className="label">Noise</span><span className="value">{value}</span></section>
const Snr = ({value}) => <section className="snr" style={{background: toColor(value, 25)}}><span className="label">Quality</span><span className="value">{value}</span></section>


const Application = React.createClass({

    getInitialState() {
      return {
          rssi: 0,
          noise: 0,
          ssid: ''
      }
    },

    componentDidMount() {
        console.log(`Application.componentDidMount`)
        ipc.on('data', (event, {rssi, noise, ssid}) => {
            //const data = message.map(({rssi}) => -rssi / 100)
            //console.log({rssi, noise, ssid});
            this.setState({rssi, noise, ssid})
        });
    },

    componentWillUnmount() {
        console.log(`Application.componentWillUnmount`)
        ipc.off('data');
    },

    render() {
        return <Display rssi={this.state.rssi} noise={this.state.noise} ssid={this.state.ssid}/>
    }
})

render(<Application />, document.getElementById('root'))