import React, { useState, useEffect, useRef } from "react";
import "../../styles/WatchMobileTablet.css";
import {
  FaFacebookF,
  FaInstagram,
  FaWhatsapp,
  FaLink,
  FaThumbsUp,
  FaThumbsDown,
  FaShareAlt,
  FaClock,
} from "react-icons/fa";

const WatchLongMobile = ({ video, related, navigate }) => {
  const formatViews = (num) => {
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + "B";
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
    return num;
  };

  const timeAgo = (dateString) => {
    const seconds = Math.floor((Date.now() - new Date(dateString)) / 1000);
    const intervals = { year: 31536000, month: 2592000, week: 604800, day: 86400 };
    for (let [unit, value] of Object.entries(intervals)) {
      const count = Math.floor(seconds / value);
      if (count >= 1) return `${count} ${unit}${count > 1 ? "s" : ""} ago`;
    }
    return "Today";
  };

  const [subscribed, setSubscribed] = useState(false);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowShare(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleShare = (platform) => {
    const shareUrl = `${window.location.origin}/watch/${video.id}`;
    let shareLink = "";
    switch (platform) {
      case "whatsapp":
        shareLink = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareUrl)}`;
        break;
      case "facebook":
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case "instagram":
        alert("Instagram doesn’t support direct sharing. Link copied!");
        navigator.clipboard.writeText(shareUrl);
        return;
      case "copy":
        navigator.clipboard.writeText(shareUrl);
        alert("Link copied to clipboard!");
        return;
      default:
        return;
    }
    window.open(shareLink, "_blank");
  };

  return (
    <div className="watch-mobile">
      {/* PLAYER */}
      <div className="player-sticky">
        <iframe
          src={`https://www.youtube.com/embed/${video.id}?autoplay=1&mute=0&rel=0`}
          allow="autoplay; encrypted-media"
          allowFullScreen
          title={video.title}
        ></iframe>
      </div>

      {/* VIDEO INFO */}
      <div className="video-info">
        <h2 className="video-title">{video.title}</h2>
        <p className="video-stats">
          {formatViews(video.views)} views • {timeAgo(video.publishedAt)}
        </p>

        {/* CHANNEL DETAILS */}
        <div className="channel-row">
          <img src={video.channelLogo} alt={video.channelTitle} className="channel-logo" />
          <div className="channel-info">
            <h3>{video.channelTitle}</h3>
            <span>120K subscribers</span>
          </div>
          <button
            className="subscribe-btn"
            style={{
              background: subscribed ? "green" : "#cc0000",
            }}
            onClick={() => setSubscribed(!subscribed)}
          >
            {subscribed ? "Subscribed" : "Subscribe"}
          </button>
        </div>

        {/* ACTION BAR (SECOND ROW) */}
        <div className="video-actions" style={{ marginTop: "10px" }}>
          <button
            onClick={() => {
              setLiked(!liked);
              if (!liked) setDisliked(false);
            }}
            style={{ background: liked ? "#3ea6ff" : "#222" }}
            title="Like"
          >
            <FaThumbsUp />
          </button>

          <button
            onClick={() => {
              setDisliked(!disliked);
              if (!disliked) setLiked(false);
            }}
            style={{ background: disliked ? "#3ea6ff" : "#222" }}
            title="Dislike"
          >
            <FaThumbsDown />
          </button>

          <div className="share-wrapper" style={{ position: "relative" }} ref={dropdownRef}>
            <button onClick={() => setShowShare(!showShare)} title="Share">
              <FaShareAlt />
            </button>
            {showShare && (
              <div
                className="share-dropdown"
                style={{
                  position: "absolute",
                  top: "40px",
                  right: 0,
                  background: "#181818",
                  border: "1px solid #333",
                  borderRadius: "8px",
                  padding: "8px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  animation: "fadeIn 0.2s ease-in-out",
                  minWidth: "130px",
                }}
              >
                <button onClick={() => handleShare("facebook")}>
                  <FaFacebookF /> &nbsp;Facebook
                </button>
                <button onClick={() => handleShare("instagram")}>
                  <FaInstagram /> &nbsp;Instagram
                </button>
                <button onClick={() => handleShare("whatsapp")}>
                  <FaWhatsapp /> &nbsp;WhatsApp
                </button>
                <button onClick={() => handleShare("copy")}>
                  <FaLink /> &nbsp;Copy Link
                </button>
              </div>
            )}
          </div>

          <button onClick={() => alert("Added to Watch Later!")}>
            <FaClock />
          </button>
        </div>

        {/* COMMENT INPUT */}
        <div className="comment-row">
          <input type="text" placeholder="Add a comment..." />
          <button className="comment-post">Post</button>
        </div>
      </div>

      {/* RELATED VIDEOS */}
      <div className="related-section">
        <h3 className="related-heading">Recommended</h3>
        <div className="related-scroll">
          {related.map((r) => (
            <div key={r.id} className="related-card" onClick={() => navigate(`/watch/${r.id}`)}>
              <img src={r.thumbnail} alt={r.title} className="related-thumb" />
              <div className="related-info">
                <h4 className="related-title">{r.title}</h4>
                <p className="related-meta">
                  {formatViews(r.views)} views • {timeAgo(r.publishedAt)}
                </p>
                <div className="related-channel-row">
                  {r.channelLogo && (
                    <img
                      src={r.channelLogo}
                      alt={r.channelTitle}
                      className="related-channel-logo"
                    />
                  )}
                  <span className="related-channel-name">{r.channelTitle}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WatchLongMobile;
