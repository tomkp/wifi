import React from 'react';
import {render} from 'react-dom';
import electron from 'electron';
const ipc = electron.ipcRenderer;
import './application.scss';


import Graph from './Graph';
import './graph.scss';


const Display = ({rssi, noise, ssid}) => {
    return (
        <div className="display">
            <Ssid name={ssid} />
            <Signal value={100 + rssi} />
            <Noise value={100 + noise} />
            <Snr value={Math.abs(noise - rssi)} />
        </div>
    )
}

const Ssid = ({name}) => <div className="ssid">{name}</div>
const Signal = ({value}) => <div className="signal">{value}</div>
const Noise = ({value}) => <div className="noise">{value}</div>
const Snr = ({value}) => <div className="snr">{value}</div>


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
            console.log({rssi, noise, ssid});
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