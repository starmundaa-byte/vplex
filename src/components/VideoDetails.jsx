import React, { useState, useRef, useEffect } from "react";
import { FaThumbsUp, FaThumbsDown, FaShare, FaClock, FaWhatsapp, FaFacebook, FaInstagram, FaLink } from "react-icons/fa";
import { db } from "../firebase";
import { doc, updateDoc, increment } from "firebase/firestore";
import "../styles/VideoDetails.css";

const VideoDetails = ({ videoId, title, views, timeAgo, channel }) => {
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [comment, setComment] = useState("");
  const [showShareMenu, setShowShareMenu] = useState(false);
  const shareMenuRef = useRef(null);

  // ✅ Close share dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(e.target)) {
        setShowShareMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLike = async () => {
    if (liked) return;
    setLiked(true);
    setDisliked(false);
    await updateDoc(doc(db, "videos", videoId), { likes: increment(1) });
  };

  const handleDislike = async () => {
    if (disliked) return;
    setDisliked(true);
    setLiked(false);
    await updateDoc(doc(db, "videos", videoId), { dislikes: increment(1) });
  };

  const handleSubscribe = () => setSubscribed(!subscribed);

  // ✅ Share dropdown options
  const handleShareOption = (platform) => {
    const videoLink = `${window.location.origin}/watch/${videoId}`;
    const text = encodeURIComponent(`Watch this video on Vplex! ${videoLink}`);
    let shareUrl = "";

    switch (platform) {
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${text}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${videoLink}`;
        break;
      case "instagram":
        shareUrl = `https://www.instagram.com/?url=${videoLink}`;
        break;
      case "copy":
        navigator.clipboard.writeText(videoLink);
        break;
      default:
        break;
    }
    if (shareUrl) window.open(shareUrl, "_blank");
    setShowShareMenu(false);
  };

  const handleWatchLater = () => alert("Added to Watch Later!");

  const handleCommentSubmit = () => {
    if (comment.trim()) {
      console.log("Comment posted:", comment);
      setComment("");
    }
  };

  return (
    <div className="video-details-container">
      {/* 🎥 Title */}
      <h2 className="video-title">{title}</h2>

      {/* 👁 Views + Time */}
      <p className="video-meta">{views} views • {timeAgo}</p>

      {/* 👤 Channel Row */}
      <div className="channel-row">
        <div className="channel-info">
          <img src={channel.logo} alt={channel.name} className="channel-logo" />
          <div className="channel-text">
            <h4 className="channel-name">{channel.name}</h4>
            <span className="channel-subs">1.2M subscribers</span>
          </div>
        </div>
        <button
          className={`subscribe-btn ${subscribed ? "subscribed" : ""}`}
          onClick={handleSubscribe}
        >
          {subscribed ? "Subscribed" : "Subscribe"}
        </button>
      </div>

      {/* 👍 Actions */}
      <div className="action-buttons" ref={shareMenuRef}>
        <button
          className={`action-btn ${liked ? "active" : ""}`}
          onClick={handleLike}
        >
          <FaThumbsUp /> Like
        </button>
        <button
          className={`action-btn ${disliked ? "active" : ""}`}
          onClick={handleDislike}
        >
          <FaThumbsDown /> Dislike
        </button>

        {/* ✅ Share Dropdown */}
        <div className="share-dropdown">
          <button
            className="action-btn"
            onClick={() => setShowShareMenu(!showShareMenu)}
          >
            <FaShare /> Share
          </button>

          {showShareMenu && (
            <div className="share-menu">
              <button onClick={() => handleShareOption("whatsapp")}>
                <FaWhatsapp /> WhatsApp
              </button>
              <button onClick={() => handleShareOption("facebook")}>
                <FaFacebook /> Facebook
              </button>
              <button onClick={() => handleShareOption("instagram")}>
                <FaInstagram /> Instagram
              </button>
              <button onClick={() => handleShareOption("copy")}>
                <FaLink /> Copy Link
              </button>
            </div>
          )}
        </div>

        <button className="action-btn" onClick={handleWatchLater}>
          <FaClock /> Watch Later
        </button>
      </div>

      {/* 💬 Comment box */}
      <div className="comment-section">
        <input
          type="text"
          placeholder="Add a comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <button onClick={handleCommentSubmit}>Post</button>
      </div>
    </div>
  );
};

export default VideoDetails;
