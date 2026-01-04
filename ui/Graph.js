import React from 'react';

export default React.createClass({
    componentWillReceiveProps(_props) {
        const data = this.props.data;
        const canvas = this.refs['canvas'];
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        const count = data.length;
        const y = canvas.height;
        const barWidth = canvas.width / count;

        context.fillStyle = 'rgba(0, 0, 0, 0.1)';

        for (let i = 0; i < data.length; i++) {
            const w = barWidth;
            const x = i * w;
            const h = (y * -data[i]) / 100;
            context.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
        }
    },

    render() {
        return <canvas className="graph" ref="canvas" width={this.props.data.length} />;
    }
});
