import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Radio, Sun, Moon, Server, Settings, ChevronUp, ChevronDown, Info as InfoIcon } from 'lucide-react';
import { updateNodeMeta } from '../services/mockData';
import './Sidebar.css';

const Sidebar = ({ nodes, theme, toggleTheme }) => {
    const [isReordering, setIsReordering] = useState(false);

    const handleMove = (node, direction) => {
        const index = nodes.findIndex(n => n.id === node.id);
        if (index === -1) return;

        let newOrder = [...nodes];
        // simple swap logic by index since nodes are already sorted
        if (direction === 'up' && index > 0) {
            const temp = newOrder[index - 1];
            newOrder[index - 1] = newOrder[index];
            newOrder[index] = temp;
        } else if (direction === 'down' && index < newOrder.length - 1) {
            const temp = newOrder[index + 1];
            newOrder[index + 1] = newOrder[index];
            newOrder[index] = temp;
        } else {
            return;
        }

        // Actually, just batch update order property based on new index
        newOrder.forEach((n, idx) => {
            updateNodeMeta(n.id, { order: idx });
        });
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <Radio size={28} className="logo-icon" />
                <h2>WaterMon</h2>
            </div>

            <nav className="sidebar-nav">
                <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <LayoutDashboard size={20} />
                    <span>Overview</span>
                </NavLink>
                <NavLink to="/integration" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <Server size={20} />
                    <span>Integration</span>
                </NavLink>
                <NavLink to="/info" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <InfoIcon size={20} />
                    <span>Info</span>
                </NavLink>

                <div className="nav-section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Nodes</span>
                    <button
                        onClick={() => setIsReordering(!isReordering)}
                        className="icon-btn-small"
                        title="Reorder Nodes"
                    >
                        <Settings size={14} color={isReordering ? "var(--color-primary)" : "var(--text-secondary)"} />
                    </button>
                </div>

                {nodes.map((node, i) => (
                    <div key={node.id} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {isReordering && (
                            <div className="reorder-controls">
                                <button className="order-btn" onClick={() => handleMove(node, 'up')} disabled={i === 0}>
                                    <ChevronUp size={12} />
                                </button>
                                <button className="order-btn" onClick={() => handleMove(node, 'down')} disabled={i === nodes.length - 1}>
                                    <ChevronDown size={12} />
                                </button>
                            </div>
                        )}
                        <NavLink
                            to={`/node/${node.id}`}
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                            style={{ flex: 1 }}
                        >
                            <div className={`status-dot ${node.status}`}></div>
                            <span>{node.name}</span>
                        </NavLink>
                    </div>
                ))}
            </nav>

            <div style={{ padding: '1rem', borderTop: '1px solid var(--sidebar-border)' }}>
                <button
                    onClick={toggleTheme}
                    className="theme-toggle"
                >
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
