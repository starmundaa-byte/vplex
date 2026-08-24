import React, { useState, useEffect, useRef } from 'react';
import '../styles/DownloadButton.css';

const DownloadButton = () => {
    const [showPopup, setShowPopup] = useState(false);
    const [platform, setPlatform] = useState('');
    const [copied, setCopied] = useState(false);
    const popupRef = useRef(null);

    useEffect(() => {
        const userAgent = navigator.userAgent.toLowerCase();
        if (userAgent.includes('android')) {
            setPlatform('android');
        } else if (userAgent.includes('win')) {
            setPlatform('windows');
        } else if (userAgent.includes('mac')) {
            setPlatform('mac');
        } else {
            setPlatform('other');
        }
    }, []);

    // Close popup when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (popupRef.current && !popupRef.current.contains(e.target)) {
                setShowPopup(false);
            }
        };
        if (showPopup) {
            document.addEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'auto';
        };
    }, [showPopup]);

    const downloads = {
        windows: {
            icon: '💻',
            name: 'Windows',
            size: '80 MB',
            link: '/downloads/VPlex-win32-x64/VPlex.exe',
            color: '#0078d4'
        },
        android: {
            icon: '📱',
            name: 'Android',
            size: '25 MB',
            link: '/downloads/VPlex-Android.apk',
            color: '#34a853'
        },
        mac: {
            icon: '🍎',
            name: 'macOS',
            size: 'Coming Soon',
            link: '#',
            color: '#555'
        },
        linux: {
            icon: '🐧',
            name: 'Linux',
            size: 'Coming Soon',
            link: '#',
            color: '#555'
        }
    };

    const trackDownload = (platform) => {
        console.log(`📥 Download started: ${platform}`);
        setShowPopup(false);
    };

    // Share Website Function
    const shareWebsite = () => {
        const websiteUrl = window.location.origin;
        
        if (navigator.share) {
            navigator.share({
                title: 'VPlex - Video Player',
                text: '🎬 Check out VPlex - The best video player! Watch videos without ads and enjoy a seamless experience.',
                url: websiteUrl,
            }).catch(() => {});
        } else {
            navigator.clipboard.writeText(websiteUrl).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 3000);
            }).catch(() => {
                const textArea = document.createElement('textarea');
                textArea.value = websiteUrl;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                setCopied(true);
                setTimeout(() => setCopied(false), 3000);
            });
        }
    };

    return (
        <>
            {/* Header Compact Download Button */}
            <button 
                className="header-download-btn-compact"
                onClick={() => setShowPopup(!showPopup)}
                title="Download VPlex App"
            >
                <svg className="download-icon" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                </svg>
                <span className="download-text">Get App</span>
            </button>

            {/* Download Popup */}
            {showPopup && (
                <div className="download-popup-overlay">
                    <div className="download-popup" ref={popupRef}>
                        <button className="popup-close" onClick={() => setShowPopup(false)}>
                            ✕
                        </button>
                        
                        <div className="popup-header">
                            <img 
                                src="/logo2.png" 
                                alt="VPlex" 
                                className="popup-logo"
                            />
                            <h2>Download VPlex</h2>
                            <p>Get the app for your device</p>
                        </div>

                        {/* ===== SHARE WEBSITE SECTION ===== */}
                        <div className="share-website-section">
                            <div className="share-website-content">
                                {/* 👥 FRIENDS ICON - Left Side */}
                                <span className="share-website-friends-icon">👥</span>
                                
                                <div className="share-website-text">
                                    <span className="share-website-title">Share VPlex with friends</span>
                                    <span className="share-website-desc">🎬 Watch videos without ads • Free & Open Source</span>
                                </div>
                                
                                {/* SHARE BUTTON WITH VPLEX LOGO */}
                                <button 
                                    className="share-website-btn"
                                    onClick={shareWebsite}
                                >
                                    <img 
                                        src="/logo2.png" 
                                        alt="VPlex" 
                                        className="share-btn-logo"
                                    />
                                    {copied ? 'Copied!' : 'Share'}
                                </button>
                            </div>
                        </div>

                        <div className="popup-platforms">
                            {/* Windows */}
                            <a href="/downloads/VPlex-win32-x64/VPlex.exe" 
                               className="platform-card windows"
                               onClick={() => trackDownload('windows')}>
                                <div className="platform-icon">💻</div>
                                <h3>Windows</h3>
                                <p>Windows 10/11 • 80 MB</p>
                                <span className="download-badge">⬇️ Download</span>
                            </a>

                            {/* Android */}
                            <a href="/downloads/VPlex-Android.apk" 
                               className="platform-card android"
                               onClick={() => trackDownload('android')}>
                                <div className="platform-icon">📱</div>
                                <h3>Android</h3>
                                <p>Android 8.0+ • 25 MB</p>
                                <span className="download-badge">⬇️ Download</span>
                            </a>

                            {/* macOS */}
                            <div className="platform-card mac coming-soon">
                                <div className="platform-icon">🍎</div>
                                <h3>macOS</h3>
                                <p>Coming Soon</p>
                                <span className="coming-badge">🔜</span>
                            </div>

                            {/* Linux */}
                            <div className="platform-card linux coming-soon">
                                <div className="platform-icon">🐧</div>
                                <h3>Linux</h3>
                                <p>Coming Soon</p>
                                <span className="coming-badge">🔜</span>
                            </div>
                        </div>

                        <div className="popup-footer">
                            <span className="version">v1.0.0</span>
                            <span className="divider">•</span>
                            <span className="free">Free & Open Source</span>
                            <span className="divider">•</span>
                            <span className="secure">🔒 Secure</span>
                        </div>

                        {platform && platform !== 'other' && (
                            <div className="recommendation">
                                <span>✨ Recommended for you: </span>
                                <strong>{downloads[platform]?.name || 'Windows'}</strong>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default DownloadButton;