import React from 'react';

const Bars = (data, width = 500, height = 300) => {
    const maxValue = Math.max(...data.map(d => d.value));
    const barWidth = width / data.length;
    
    return (
        <svg width={width} height={height}>
        {data.map((d, i) => (
            <rect
            key={i}
            x={i * barWidth}
            y={height - (d.value / maxValue) * height}
            width={barWidth - 2}
            height={(d.value / maxValue) * height}
            fill="steelblue"
            />
        ))}
        </svg>
    );
    }

export default Bars;
