import React from 'react';
import { Download } from 'lucide-react';
import { format } from 'date-fns';
import './DataLogTable.css';

const DataLogTable = ({ history }) => {
    // Take the last 50 points for display to avoid lag, but export full 
    const displayData = [...history].reverse().slice(0, 50);

    const downloadCSV = () => {
        const headers = ['Timestamp,pH,TDS,Turbidity,Temp,DO,RSSI,SNR,Battery'];
        const rows = history.map(row => {
            return [
                `"${row.timestamp.toISOString()}"`,
                row.sensors.ph.toFixed(2),
                Math.round(row.sensors.tds),
                row.sensors.turbidity.toFixed(1),
                row.sensors.temperature.toFixed(2),
                row.sensors.do.toFixed(2),
                row.connection.rssi,
                row.connection.snr.toFixed(1),
                Math.round(row.battery)
            ].join(',');
        });

        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `node_data_log_${new Date().toISOString()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="datalog-container">
            <div className="datalog-header">
                <h3>Data Log (Last 50)</h3>
                <button onClick={downloadCSV} className="export-btn">
                    <Download size={16} />
                    Export All (CSV)
                </button>
            </div>

            <div className="table-wrapper">
                <table className="datalog-table">
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>pH</th>
                            <th>TDS</th>
                            <th>Turbidity</th>
                            <th>Temp</th>
                            <th>Batt</th>
                            <th>Signal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayData.map((row, idx) => (
                            <tr key={idx}>
                                <td>{format(row.timestamp, 'HH:mm:ss')}</td>
                                <td>{row.sensors.ph.toFixed(1)}</td>
                                <td>{Math.round(row.sensors.tds)}</td>
                                <td>{row.sensors.turbidity.toFixed(1)}</td>
                                <td>{row.sensors.temperature.toFixed(1)}°</td>
                                <td>{Math.round(row.battery)}%</td>
                                <td>{row.connection.rssi}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DataLogTable;
