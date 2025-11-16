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
  const shareRef = useRef(null);

  // --- FIX PRIMARY ISSUE ---
  const videoId =
    video?.id?.videoId || video?.id || video?.snippet?.resourceId?.videoId;

  const videoTitle = video?.snippet?.title || "Video";

  // Always generate usable share link
  const shareLink = `${window.location.origin}/watch/${videoId}`;

  const handleCopy = () => {
    if (!videoId) {
      alert("Error: Invalid Video ID");
      return;
    }

    navigator.clipboard.writeText(shareLink);
    alert("Link copied!");
    setShowShare(false);
  };

  // Close dropdown if clicked outside
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
          <button className="action-btn" onClick={() => setShowShare(!showShare)}>
            <FaShareAlt /> Share
          </button>

          {showShare && (
            <div className="share-dropdown">

              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `${videoTitle} - ${shareLink}`
                )}`}
                target="_blank"
                rel="noreferrer"
              >
                <FaWhatsapp /> WhatsApp
              </a>

              <a
                href={`https://www.instagram.com/?url=${encodeURIComponent(
                  shareLink
                )}`}
                target="_blank"
                rel="noreferrer"
              >
                <FaInstagram /> Instagram
              </a>

              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                  shareLink
                )}`}
                target="_blank"
                rel="noreferrer"
              >
                <FaFacebook /> Facebook
              </a>

              <button onClick={handleCopy}>
                <FaLink /> Copy Link
              </button>
            </div>
          )}
        </div>

        {/* WATCH LATER */}
        <button className="action-btn">
          <FaClock /> Watch Later
        </button>
      </div>
    </div>
  );
}
