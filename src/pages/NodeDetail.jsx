import React, { useState, useEffect } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { Wifi, Activity, Battery, Pencil, Check, X, Trash2 } from 'lucide-react';
import { SensorChart } from '../components/SensorChart';
import BatteryGauge from '../components/BatteryGauge';
import DataLogTable from '../components/DataLogTable';
import { updateNodeMeta, removeNode } from '../services/mockData';
import './NodeDetail.css';

const NodeDetail = ({ nodes }) => {
    const { id } = useParams();
    const navigate = useNavigate(); // Hook for redirection
    const [timeRange, setTimeRange] = useState('10m');

    // Find node
    const node = nodes.find(n => n.id === id);

    // Rename state
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState('');

    useEffect(() => {
        if (node && !isEditing) setNewName(node.name);
    }, [node, isEditing]);

    if (!node) return <Navigate to="/" />;

    const handleSaveName = () => {
        if (newName.trim()) {
            updateNodeMeta(node.id, { name: newName });
            setIsEditing(false);
        }
    };

    // Transform history for charts ... (omitted)
    const history = node.history || [];
    const getFilteredHistory = () => { /* ... existing logic ... */
        if (!history.length) return [];
        const now = new Date();
        let minutesToKeep = 10;
        if (timeRange === '1h') minutesToKeep = 60;
        if (timeRange === '24h') minutesToKeep = 1440;
        const cutoff = new Date(now.getTime() - minutesToKeep * 60000);
        return history.filter(h => new Date(h.timestamp) > cutoff);
    };
    const filteredHistory = getFilteredHistory();
    const getHistory = (path) => filteredHistory.map(h => { /* ... existing logic ... */
        if (!path.includes('.')) return { timestamp: h.timestamp, value: h[path] };
        const [cat, key] = path.split('.');
        return { timestamp: h.timestamp, value: h[cat][key] };
    });

    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete ${node.name}? This cannot be undone.`)) {
            removeNode(node.id);
            navigate('/');
        }
    };

    return (
        <div className="node-detail-page">
            <header className="detail-header">
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {isEditing ? (
                            <div className="rename-box">
                                <input
                                    className="rename-input"
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                    autoFocus
                                    onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                                />
                                <button className="icon-btn-small" onClick={handleSaveName}><Check size={18} color="var(--color-success)" /></button>
                                <button className="icon-btn-small" onClick={() => { setIsEditing(false); setNewName(node.name); }}><X size={18} color="var(--color-error)" /></button>
                                <div style={{ width: '1px', height: '24px', background: 'var(--glass-border)', margin: '0 0.5rem' }}></div>
                                <button
                                    className="icon-btn-small"
                                    onClick={handleDelete}
                                    title="Delete Node"
                                    style={{ background: 'rgba(239, 68, 68, 0.1)' }}
                                >
                                    <Trash2 size={18} color="#ef4444" />
                                </button>
                            </div>
                        ) : (
                            <>
                                <h1>{node.name}</h1>
                                <button className="icon-btn-small" onClick={() => setIsEditing(true)}>
                                    <Pencil size={16} color="var(--text-secondary)" />
                                </button>
                            </>
                        )}
                    </div>
                    <div className="last-seen">
                        Last packet: {node.lastSeen.toLocaleTimeString()} <span style={{ margin: '0 0.5rem' }}>•</span> <span style={{ color: node.status === 'online' ? 'var(--color-success)' : 'var(--color-error)', textTransform: 'capitalize' }}>{node.status}</span>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div className="time-controls">
                        {['10m', '1h', '24h'].map(t => (
                            <button
                                key={t}
                                className={`time-btn ${timeRange === t ? 'active' : ''}`}
                                onClick={() => setTimeRange(t)}
                            >
                                {t}
                            </button>
                        ))}
                    </div>

                    <div className="battery-display">
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>BATTERY LEVEL</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{Math.round(node.battery)}%</div>
                        </div>
                        <BatteryGauge level={node.battery} />
                    </div>
                </div>
            </header>

            <section className="metrics-section">
                <h3><Battery size={20} color="#f59e0b" /> Node Health</h3>
                <div className="charts-grid">
                    <div className="chart-card">
                        <SensorChart title="Battery Drain" data={getHistory('battery')} unit="%" color="#f59e0b" />
                    </div>
                </div>
            </section>

            <section className="metrics-section">
                <h3><Wifi size={20} color="#8b5cf6" /> Connection Metrics</h3>
                <div className="charts-grid">
                    <div className="chart-card">
                        <SensorChart title="RSSI" data={getHistory('connection.rssi')} unit="dBm" color="#8b5cf6" />
                    </div>
                    <div className="chart-card">
                        <SensorChart title="SNR" data={getHistory('connection.snr')} unit="dB" color="#ec4899" />
                    </div>
                    <div className="chart-card">
                        <SensorChart title="PDR" data={getHistory('connection.pdr')} unit="%" color="#10b981" />
                    </div>
                </div>
            </section>

            <section className="metrics-section">
                <h3><Activity size={20} color="#3b82f6" /> Water Quality Sensors</h3>
                <div className="charts-grid">
                    <div className="chart-card">
                        <SensorChart title="pH Level" data={getHistory('sensors.ph')} color="#3b82f6" />
                    </div>
                    <div className="chart-card">
                        <SensorChart title="Turbidity" data={getHistory('sensors.turbidity')} unit="NTU" color="#f97316" />
                    </div>
                    <div className="chart-card">
                        <SensorChart title="Temperature" data={getHistory('sensors.temperature')} unit="°C" color="#ef4444" />
                    </div>
                    <div className="chart-card">
                        <SensorChart title="TDS" data={getHistory('sensors.tds')} unit="ppm" color="#6366f1" />
                    </div>
                    <div className="chart-card">
                        <SensorChart title="Dissolved Oxygen" data={getHistory('sensors.do')} unit="mg/L" color="#06b6d4" />
                    </div>
                </div>
            </section>

            <section className="metrics-section">
                <DataLogTable history={filteredHistory} />
            </section>
        </div>
    );
};

export default NodeDetail;
