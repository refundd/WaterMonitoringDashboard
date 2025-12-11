import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import NodeDetail from './pages/NodeDetail';
import Integration from './pages/Integration';
import Info from './pages/Info'; // Import Info page
import { subscribeToNodes, getNodes } from './services/mockData';
import './App.css';

function App() {
    const [nodes, setNodes] = useState([]);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

    useEffect(() => {
        document.body.className = `theme-${theme}`;
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    useEffect(() => {
        const unsubscribe = subscribeToNodes((data) => {
            setNodes([...data]);
        });
        return unsubscribe;
    }, []);

    return (
        <BrowserRouter>
            <div className="app-container">
                <Sidebar nodes={nodes} theme={theme} toggleTheme={toggleTheme} />
                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<Dashboard nodes={nodes} />} />
                        <Route path="/node/:id" element={<NodeDetail nodes={nodes} />} />
                        <Route path="/integration" element={<Integration />} />
                        <Route path="/info" element={<Info />} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
}
export default App;
