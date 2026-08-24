import React, { useState } from 'react';
import '../styles/DeveloperProfile.css';

const DeveloperProfile = () => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div 
            className="developer-profile"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="developer-card">
                <div className="developer-avatar-wrapper">
                    <img 
                        src="/developer.jpg" 
                        alt="Developer" 
                        className="developer-avatar"
                    />
                    <div className={`developer-status ${isHovered ? 'active' : ''}`}>
                        <span className="status-dot"></span>
                        <span className="status-text">Active</span>
                    </div>
                </div>
                
                <div className="developer-info">
                    <h3 className="developer-name">Your Name</h3>
                    <p className="developer-role">🚀 Founder & Developer</p>
                    <p className="developer-bio">
                        Building VPlex - A better way to watch videos without ads
                    </p>
                    
                    <div className="developer-social">
                        <a href="https://github.com/yourusername" target="_blank" rel="noopener noreferrer" className="social-link github">
                            <span>🐙</span> GitHub
                        </a>
                        <a href="https://linkedin.com/in/yourusername" target="_blank" rel="noopener noreferrer" className="social-link linkedin">
                            <span>💼</span> LinkedIn
                        </a>
                        <a href="https://twitter.com/yourusername" target="_blank" rel="noopener noreferrer" className="social-link twitter">
                            <span>🐦</span> Twitter
                        </a>
                        <a href="mailto:your@email.com" className="social-link email">
                            <span>✉️</span> Email
                        </a>
                    </div>
                </div>
            </div>

            <div className="developer-footer">
                <span>❤️ Made with passion by</span>
                <strong>Your Name</strong>
                <span className="footer-year">© 2026</span>
            </div>
        </div>
    );
};

export default DeveloperProfile;