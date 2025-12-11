import React, { useState, useEffect } from 'react';
import { Key, Copy, Check, Server, FileJson } from 'lucide-react';
import { processIncomingPacket } from '../services/mockData';
import './Integration.css';

import { useLanguage } from '../contexts/LanguageContext';

const Integration = () => {
    const { t } = useLanguage();
    // ... hooks

    // ... existing handlers

    return (
        <div className="integration-page">
            <header className="page-header">
                <h1>{t('sidebar.integration')}</h1>
                <p className="text-muted">{t('integration.description')}</p>
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
                        <h3>{t('integration.payloadFormat')}</h3>
                    </div>
                    <p className="description">
                        {t('integration.description')}
                    </p>
                    <pre className="code-block">
                        {JSON.stringify(payloadExample, null, 2)}
                    </pre>
                </section>

                <section className="config-card full-width test-console">
                    <div className="card-title">
                        <div className="test-icon-wrapper">🚀</div>
                        <h3>{t('integration.testConsole')}</h3>
                    </div>
                    <p className="description">
                        {t('integration.simulate')} <code>device_id</code>
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
                            {t('integration.simulateBtn')}
                        </button>
                        {message && (
                            <span className={`status-msg ${message.includes('Error') ? 'error' : 'success'}`}>
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
