import React from 'react';
import { Line } from 'react-chartjs-2';
import { format } from 'date-fns';

const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false,
        },
        tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
                label: function (context) {
                    let label = context.dataset.label || '';
                    if (label) {
                        label += ': ';
                    }
                    if (context.parsed.y !== null) {
                        // Format number to max 1 or 2 decimals
                        label += Number(context.parsed.y).toFixed(2);
                    }
                    return label;
                }
            }
        },
    },
    scales: {
        x: {
            grid: {
                display: false,
            },
            ticks: {
                maxTicksLimit: 5,
            },
        },
        y: {
            border: {
                dash: [4, 4],
            },
            grid: {
                color: '#e5e7eb',
            },
        },
    },
    interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
    },
    elements: {
        point: {
            radius: 0,
            hoverRadius: 4,
        },
        line: {
            tension: 0.4, // Smooth curves
        }
    }
};

export const SensorChart = ({ title, data, color = '#2563eb', unit = '' }) => {
    const chartData = {
        labels: data.map(d => format(d.timestamp, 'HH:mm:ss')),
        datasets: [
            {
                label: title,
                data: data.map(d => d.value),
                borderColor: color,
                backgroundColor: color + '20', // transparent fill
                fill: true,
                borderWidth: 2,
            },
        ],
    };

    return (
        <div className="chart-container" style={{ height: '200px', width: '100%' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#6b7280' }}>
                {title} <span style={{ float: 'right', color: color }}>Current: {Number(data[data.length - 1]?.value).toFixed(1)} {unit}</span>
            </h4>
            <Line options={options} data={chartData} />
        </div>
    );
};
