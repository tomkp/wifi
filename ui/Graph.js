import React from "react";


export default React.createClass({

    componentWillReceiveProps(props) {
        //console.log(`Graph.componentDidUpdate${JSON.stringify(props)}`);
        const data = this.props.data;//.reverse();
        const canvas = this.refs['canvas'];
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        const count = data.length;
        const y = canvas.height;
        const barWidth = (canvas.width) / count;

        context.fillStyle = 'rgba(0, 0, 0, 0.2)';

        for (let i = 0; i < data.length; i++) {
            const w = barWidth;
            const x = i * w;
            const h = y * -data[i] / 100;
            //console.log(`${i} ${x}, ${y}, ${w}, ${h}`);
            context.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h))
        }
    },

    render() {
        //console.log(`Graph.render`)
        //<canvas className="graph" ref="canvas" width={this.props.data.length}/>
        return (
            <canvas className="graph" ref="canvas" width={this.props.data.length}/>
        );
    }

});