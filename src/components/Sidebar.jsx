import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Radio, Sun, Moon, Server, Settings, ChevronUp, ChevronDown, Info as InfoIcon } from 'lucide-react';
import { updateNodeMeta } from '../services/mockData';
import './Sidebar.css';

import { useLanguage } from '../contexts/LanguageContext';

const Sidebar = ({ nodes, theme, toggleTheme }) => {
    const [isReordering, setIsReordering] = useState(false);
    const { t, language, toggleLanguage } = useLanguage();
    // ... move handlers

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <Radio size={28} className="logo-icon" />
                <h2>{t('sidebar.title')}</h2>
            </div>

            <nav className="sidebar-nav">
                <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <LayoutDashboard size={20} />
                    <span>{t('sidebar.overview')}</span>
                </NavLink>
                <NavLink to="/integration" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <Server size={20} />
                    <span>{t('sidebar.integration')}</span>
                </NavLink>
                <NavLink to="/info" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <InfoIcon size={20} />
                    <span>{t('sidebar.info')}</span>
                </NavLink>

                <div className="nav-section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{t('sidebar.nodes')}</span>
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

            <div style={{ padding: '1rem', borderTop: '1px solid var(--sidebar-border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button
                    onClick={toggleLanguage}
                    className="theme-toggle"
                >
                    <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>{language === 'en' ? '🇬🇧' : '🇮🇩'}</span>
                    <span>{language === 'en' ? 'English' : 'Indonesia'}</span>
                </button>
                <button
                    onClick={toggleTheme}
                    className="theme-toggle"
                >
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    <span>{theme === 'dark' ? t('sidebar.lightMode') : t('sidebar.darkMode')}</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
