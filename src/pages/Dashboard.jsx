import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Signal, Droplets, Thermometer, Wifi } from 'lucide-react';
import BatteryGauge from '../components/BatteryGauge';
import './Dashboard.css';

const Dashboard = ({ nodes }) => {
    return (
        <div className="dashboard-page">
            <header className="page-header">
                <h1>Overview</h1>
                <p className="text-muted">Monitoring {nodes.length} Active Nodes • Network Health: Excellent</p>
            </header>

            <div className="nodes-grid">
                {nodes.map(node => (
                    <Link key={node.id} to={`/node/${node.id}`} className="node-card">
                        <div className={`card-header ${node.status}`}>
                            <h3>{node.name}</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <BatteryGauge level={node.battery} />
                                <span className="status-badge">{node.status}</span>
                            </div>
                        </div>

                        <div className="card-body">
                            <div className="metric-row">
                                <div className="metric">
                                    <span className="label">Signal Quality</span>
                                    <span className="value" style={{ color: node.connection.rssi > -100 ? 'var(--color-success)' : 'var(--color-error)' }}>
                                        {node.connection.rssi} dBm
                                    </span>
                                </div>
                                <div className="metric">
                                    <span className="label">Packet Loss</span>
                                    <span className="value">{(100 - node.connection.pdr).toFixed(1)}%</span>
                                </div>
                            </div>

                            <div className="sensor-grid">
                                <div className="sensor-item">
                                    <Droplets size={16} color="var(--color-info)" />
                                    <span>pH</span>
                                    <strong>{node.sensors.ph.toFixed(1)}</strong>
                                </div>
                                <div className="sensor-item">
                                    <Activity size={16} color="var(--color-warning)" />
                                    <span>TDS</span>
                                    <strong>{Math.round(node.sensors.tds)}</strong>
                                </div>
                                <div className="sensor-item">
                                    <Thermometer size={16} color="var(--color-error)" />
                                    <span>Temp</span>
                                    <strong>{node.sensors.temperature.toFixed(1)}°</strong>
                                </div>
                                <div className="sensor-item">
                                    <Wifi size={16} color="var(--color-secondary-glow)" />
                                    <span>SNR</span>
                                    <strong>{node.connection.snr.toFixed(1)}</strong>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
