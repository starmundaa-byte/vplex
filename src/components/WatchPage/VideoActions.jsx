import React, { useState, useRef, useEffect } from "react";
import {
  FaThumbsUp,
  FaThumbsDown,
  FaShareAlt,
  FaClock,
  FaWhatsapp,
  FaInstagram,
  FaFacebook,
  FaLink,
} from "react-icons/fa";
import "../../styles/VideoDetails.css";

export default function VideoActions({ video }) {
  const [liked, setLiked] = useState(null);
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareRef = useRef(null);

  const videoId = video?.id?.videoId || video?.id || video?.snippet?.resourceId?.videoId;
  const videoTitle = video?.snippet?.title || "Video";
  const shareLink = `${window.location.origin}/watch/${videoId}`;

  const handleQuickShare = async () => {
    if (!videoId) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: videoTitle,
          text: `Check out this video: ${videoTitle}`,
          url: shareLink,
        });
        setShowShare(false);
      } catch (err) {}
    } else {
      await handleCopy();
    }
  };

  const handleCopy = async () => {
    if (!videoId) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = shareLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
    setShowShare(false);
  };

  const shareToSocial = (platform) => {
    const urls = {
      whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${videoTitle} - ${shareLink}`)}`,
      instagram: `https://www.instagram.com/?url=${encodeURIComponent(shareLink)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`,
    };
    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'width=600,height=500');
    }
    setShowShare(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (shareRef.current && !shareRef.current.contains(event.target)) {
        setShowShare(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="action-bar">
      <div className="actions-left">

        {/* LIKE */}
        <button
          className={`action-btn ${liked === "like" ? "active" : ""}`}
          onClick={() => setLiked(liked === "like" ? null : "like")}
        >
          <FaThumbsUp /> Like
        </button>

        {/* DISLIKE */}
        <button
          className={`action-btn ${liked === "dislike" ? "active" : ""}`}
          onClick={() => setLiked(liked === "dislike" ? null : "dislike")}
        >
          <FaThumbsDown /> Dislike
        </button>

        {/* SHARE */}
        <div className="share-section" ref={shareRef}>
          <button 
            className={`action-btn share-btn ${copied ? 'copied' : ''}`}
            onClick={() => setShowShare(!showShare)}
          >
            <FaShareAlt /> 
            {copied ? 'Copied!' : 'Share'}
          </button>

          {showShare && (
            <div className="share-dropdown share-dropdown-down">
              {/* Quick Share */}
              <button onClick={handleQuickShare} className="share-option quick-share">
                <span className="quick-icon">⚡</span>
                Quick Share
              </button>

              {/* WhatsApp */}
              <button onClick={() => shareToSocial('whatsapp')} className="share-option whatsapp">
                <FaWhatsapp className="platform-icon" /> WhatsApp
              </button>

              {/* Instagram */}
              <button onClick={() => shareToSocial('instagram')} className="share-option instagram">
                <FaInstagram className="platform-icon" /> Instagram
              </button>

              {/* Facebook */}
              <button onClick={() => shareToSocial('facebook')} className="share-option facebook">
                <FaFacebook className="platform-icon" /> Facebook
              </button>

              {/* Copy Link */}
              <button onClick={handleCopy} className="share-option copy">
                <FaLink className="platform-icon" /> Copy Link
              </button>
            </div>
          )}
        </div>

        {/* WATCH LATER */}
        <button className="action-btn">
          <FaClock /> Watch Later
        </button>
      </div>

      {/* Toast */}
      {copied && (
        <div className="share-toast">
          ✅ Link copied!
        </div>
      )}
    </div>
  );
}