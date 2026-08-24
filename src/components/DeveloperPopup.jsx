import React, { useRef, useEffect, useState } from 'react';
import '../styles/DeveloperPopup.css';

const DeveloperPopup = ({ isOpen, onClose }) => {
    const popupRef = useRef(null);
    const [currentSlide, setCurrentSlide] = useState(0);

    // ===== YOUR UPLOADED IMAGES =====
    const galleryImages = [
        { src: '/g1.jpg', alt: 'Project Image 1' },
        { src: '/g2.jpg', alt: 'Project Image 2' },
        { src: '/g3.jpg', alt: 'Project Image 3' },
        { src: '/g4.jpg', alt: 'Project Image 4' },
        { src: '/g5.jpg', alt: 'Project Image 5' },
        { src: '/g6.jpg', alt: 'Project Image 6' },
        { src: '/g7.jpg', alt: 'Project Image 7' },
        { src: '/g8.jpg', alt: 'Project Image 8' },
        { src: '/g9.jpg', alt: 'Project Image 9' },
        { src: '/g10.jpg', alt: 'Project Image 10' },
    ];

    // Auto-slide every 3 seconds
    useEffect(() => {
        if (!isOpen) return;
        
        const interval = setInterval(() => {
            setCurrentSlide((prev) => {
                const next = (prev + 1) % galleryImages.length;
                console.log(`🔄 Slide: ${prev + 1} → ${next + 1} / ${galleryImages.length}`);
                return next;
            });
        }, 3000);

        return () => clearInterval(interval);
    }, [isOpen]);

    // Log current slide for debugging
    useEffect(() => {
        if (isOpen) {
            console.log(`📸 Current slide: ${currentSlide + 1} / ${galleryImages.length}`);
            console.log(`🖼️ Image: ${galleryImages[currentSlide]?.src}`);
        }
    }, [currentSlide, isOpen]);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (popupRef.current && !popupRef.current.contains(e.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'auto';
        };
    }, [isOpen, onClose]);

    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const goToSlide = (index) => {
        console.log(`👆 Manual navigation to: ${index + 1}`);
        setCurrentSlide(index);
    };

    // Debug: Log all images when popup opens
    useEffect(() => {
        if (isOpen) {
            console.log('📸 Gallery Images:');
            galleryImages.forEach((img, i) => {
                console.log(`  ${i + 1}. ${img.src}`);
            });
        }
    }, [isOpen]);

    return (
        <div className="developer-popup-overlay" onClick={onClose}>
            <div className="developer-popup" ref={popupRef} onClick={(e) => e.stopPropagation()}>
                <button className="developer-popup-close" onClick={onClose}>
                    ✕
                </button>

                {/* ===== TOP SECTION - COVER ===== */}
                <div className="dev-cover-section">
                    <div className="dev-cover-image"></div>
                    <div className="dev-profile-header">
                        <div className="dev-avatar-wrapper">
                            <img
                                src="/devby.jpeg"
                                alt="Rajkumar"
                                className="dev-avatar"
                                onError={(e) => {
                                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23667eea"/%3E%3Ctext x="50" y="55" font-size="40" text-anchor="middle" fill="white"%3E👨%3C/text%3E%3C/svg%3E';
                                }}
                            />
                            <div className="dev-status-badge">
                                <span className="status-dot"></span>
                            </div>
                        </div>
                        <div className="dev-name-title">
                            <h2 className="dev-name">Rajkumar</h2>
                            <p className="dev-title">Founder & Developer</p>
                            <p className="dev-company">VPlex • DD University, Keonjhar</p>
                        </div>
                    </div>
                </div>

                {/* ===== BODY SECTION ===== */}
                <div className="dev-body-section">
                    {/* Left Column - Profile Info */}
                    <div className="dev-left-column">
                        <div className="dev-info-card">
                            <div className="dev-info-item">
                                <span className="dev-info-label">📍 Location</span>
                                <span className="dev-info-value">Keonjhar, Odisha, India</span>
                            </div>
                            <div className="dev-info-item">
                                <span className="dev-info-label">📚 Education</span>
                                <span className="dev-info-value">DD University, Keonjhar</span>
                            </div>
                            <div className="dev-info-item">
                                <span className="dev-info-label">🛠️ Current</span>
                                <span className="dev-info-value">Building VPlex - A better way to watch videos without ads</span>
                            </div>
                            <div className="dev-info-item">
                                <span className="dev-info-label">🔗 Connect</span>
                                <div className="dev-social-links">
                                    <a href="https://www.instagram.com/rajkumar_jst" target="_blank" rel="noopener noreferrer" className="dev-social-link instagram">
                                        <span className="social-icon">📸</span>
                                        Instagram
                                    </a>
                                    <a href="https://www.facebook.com/share/1Brx8je7wz/" target="_blank" rel="noopener noreferrer" className="dev-social-link facebook">
                                        <span className="social-icon">👍</span>
                                        Facebook
                                    </a>
                                    <a href="https://github.com/yourusername" target="_blank" rel="noopener noreferrer" className="dev-social-link github">
                                        <span className="social-icon">🐙</span>
                                        GitHub
                                    </a>
                                    <a href="https://linkedin.com/in/yourusername" target="_blank" rel="noopener noreferrer" className="dev-social-link linkedin">
                                        <span className="social-icon">💼</span>
                                        LinkedIn
                                    </a>
                                    <a href="mailto:your@email.com" className="dev-social-link email">
                                        <span className="social-icon">✉️</span>
                                        Email
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="dev-bio-card">
                            <p className="dev-bio-text">
                                "Building VPlex - A better way to watch videos without ads. 
                                Student at DD University, passionate about creating products that make a difference."
                            </p>
                        </div>
                    </div>

                    {/* Right Column - Gallery */}
                    <div className="dev-right-column">
                        <div className="dev-gallery-container">
                            <div className="dev-gallery-slides">
                                {galleryImages.map((image, index) => (
                                    <div 
                                        key={index}
                                        className={`dev-gallery-slide ${index === currentSlide ? 'active' : ''}`}
                                    >
                                        <img 
                                            src={image.src} 
                                            alt={image.alt}
                                            onError={(e) => {
                                                console.error(`❌ Failed to load: ${image.src}`);
                                                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250"%3E%3Crect width="400" height="250" fill="%231a1a2e"/%3E%3Ctext x="200" y="130" font-size="20" text-anchor="middle" fill="%23667eea"%3E📸 Image Not Found%3C/text%3E%3C/svg%3E';
                                            }}
                                            onLoad={() => {
                                                console.log(`✅ Loaded: ${image.src}`);
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Indicators */}
                            <div className="dev-gallery-indicators">
                                {galleryImages.map((_, index) => (
                                    <button
                                        key={index}
                                        className={`dev-gallery-dot ${index === currentSlide ? 'active' : ''}`}
                                        onClick={() => goToSlide(index)}
                                    />
                                ))}
                            </div>

                            {/* Arrows */}
                            <button 
                                className="dev-gallery-arrow dev-gallery-arrow-prev"
                                onClick={() => goToSlide((currentSlide - 1 + galleryImages.length) % galleryImages.length)}
                            >
                                ‹
                            </button>
                            <button 
                                className="dev-gallery-arrow dev-gallery-arrow-next"
                                onClick={() => goToSlide((currentSlide + 1) % galleryImages.length)}
                            >
                                ›
                            </button>
                        </div>
                        <div className="dev-gallery-footer">
                            <span>🖼️ Project Gallery</span>
                            <span>{currentSlide + 1} / {galleryImages.length}</span>
                        </div>
                    </div>
                </div>

                {/* ===== FOOTER ===== */}
                <div className="dev-footer">
                    <span>❤️ Made with passion by</span>
                    <strong>Rajkumar</strong>
                    <span className="dev-footer-year">© 2026</span>
                </div>
            </div>
        </div>
    );
};

export default DeveloperPopup;