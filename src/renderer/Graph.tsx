import { useRef, useEffect } from 'react';

interface GraphProps {
    data: number[];
}

const Graph = ({ data }: GraphProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

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
    }, [data]);

    return <canvas className="graph" ref={canvasRef} width={data.length} />;
};

export default Graph;
