import React from 'react';
import './Info.css';

const Info = () => {
    return (
        <div className="info-page">
            <div className="info-card">
                <div className="logo-container">
                    <img src="/telkom-logo.png" alt="Telkom University Logo" className="uni-logo" />
                </div>

                <h1 className="student-name">Mohamad Rifan Kasyiful Asrar</h1>

                <div className="info-grid">
                    <div className="info-item">
                        <span className="label">Student ID (NIM)</span>
                        <span className="value">1102223020</span>
                    </div>

                    <div className="info-item">
                        <span className="label">Faculty</span>
                        <span className="value">Fakultas Teknik Elektro</span>
                    </div>

                    <div className="info-item">
                        <span className="label">Major</span>
                        <span className="value">S1 Teknik Elektro</span>
                    </div>
                </div>

                <div className="footer-note">
                    LoRaWAN Water Quality Monitoring Project
                </div>
            </div>
        </div>
    );
};

export default Info;
