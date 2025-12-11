import React, { useState, useEffect } from 'react';
import { Key, Copy, Check, Server, FileJson } from 'lucide-react';
import { processIncomingPacket } from '../services/mockData';
import './Integration.css';

const Integration = () => {
    const [apiKey, setApiKey] = useState('');
    const [copied, setCopied] = useState(false);

    const defaultPayload = {
        "deduplicationId": "uuid-1234",
        "time": new Date().toISOString(),
        "deviceInfo": {
            "deviceName": "ChirpStack-Node-01",
            "devEui": "a92fa271e4c6b107"
        },
        "object": {
            "ph": 7.4,
            "turbidity": 3.2,
            "temperature": 25.5,
            "tds": 160,
            "do": 8.1,
            "battery": 95
        },
        "rxInfo": [
            {
                "rssi": -55,
                "snr": 12.5
            }
        ]
    };

    const [testPayload, setTestPayload] = useState(JSON.stringify(defaultPayload, null, 2));
    const [message, setMessage] = useState('');

    useEffect(() => {
        const storedKey = localStorage.getItem('gateway_api_key');
        if (storedKey) {
            setApiKey(storedKey);
        } else {
            generateKey();
        }
    }, []);

    const generateKey = () => {
        const newKey = 'sk_live_' + Array.from({ length: 24 }, () => Math.floor(Math.random() * 36).toString(36)).join('');
        setApiKey(newKey);
        localStorage.setItem('gateway_api_key', newKey);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(apiKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSendPacket = () => {
        try {
            const payload = JSON.parse(testPayload);
            // Auto update timestamp to now for realism
            payload.timestamp = new Date().toISOString();
            setTestPayload(JSON.stringify(payload, null, 2));

            const result = processIncomingPacket(payload);
            setMessage(result.message);

            if (result.success) {
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (e) {
            setMessage('Error: Invalid JSON');
        }
    };

    const payloadExample = {
        "deduplicationId": "...",
        "time": "2024-12-10T10:30:00Z",
        "deviceInfo": {
            "deviceName": "My-Sensor-1",
        },
        "object": {
            "ph": 7.2,
            "turbidity": 4.5,
            "temperature": 26.1,
            "tds": 145,
            "do": 8.4
        },
        "rxInfo": [{ "rssi": -85, "snr": 8 }]
    };

    return (
        <div className="integration-page">
            <header className="page-header">
                <h1>Integration</h1>
                <p className="text-muted">Configure your LoRaWAN Gateway to send data to this dashboard.</p>
            </header>

            <div className="integration-grid">
                <section className="config-card">
                    <div className="card-title">
                        <Key size={20} className="text-accent" />
                        <h3>Authentication</h3>
                    </div>
                    <p className="description">
                        Include this API Key in the <code>Authorization</code> header of your HTTP POST requests.
                    </p>

                    <div className="key-display">
                        <code>{apiKey}</code>
                        <button onClick={copyToClipboard} className="icon-btn" title="Copy Key">
                            {copied ? <Check size={18} color="var(--color-success)" /> : <Copy size={18} />}
                        </button>
                    </div>

                    <button onClick={generateKey} className="secondary-btn">
                        Generate New Key
                    </button>
                </section>

                <section className="config-card">
                    <div className="card-title">
                        <Server size={20} className="text-accent" />
                        <h3>HTTP Endpoint</h3>
                    </div>
                    <p className="description">
                        Send <strong>POST</strong> requests to the following URL:
                    </p>
                    <div className="endpoint-box">
                        <span className="method">POST</span>
                        <span className="url">https://api.watermon.io/v1/telemetry</span>
                    </div>
                </section>

                <section className="config-card full-width">
                    <div className="card-title">
                        <FileJson size={20} className="text-accent" />
                        <h3>Payload Schema</h3>
                    </div>
                    <p className="description">
                        Your gateway must send JSON data in this format.
                    </p>
                    <pre className="code-block">
                        {JSON.stringify(payloadExample, null, 2)}
                    </pre>
                </section>

                <section className="config-card full-width test-console">
                    <div className="card-title">
                        <div className="test-icon-wrapper">🚀</div>
                        <h3>Test Console</h3>
                    </div>
                    <p className="description">
                        Simulate a packet to test <strong>Auto-Discovery</strong>. Change the <code>device_id</code> to create a new node instantly!
                    </p>

                    <div className="console-editor">
                        <textarea
                            value={testPayload}
                            onChange={(e) => setTestPayload(e.target.value)}
                            spellCheck="false"
                        />
                    </div>

                    <div className="console-actions">
                        <button onClick={handleSendPacket} className="primary-btn">
                            Send Packet
                        </button>
                        {message && (
                            <span className={`status - msg ${message.includes('Error') ? 'error' : 'success'} `}>
                                {message}
                            </span>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Integration;
