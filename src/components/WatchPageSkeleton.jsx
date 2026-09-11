// src/components/WatchPageSkeleton.jsx
import React from "react";
import "../styles/WatchPageSkeleton.css";

const WatchPageSkeleton = () => {
  return (
    <div className="watch-skeleton-container">
      {/* 1. Large Player Area */}
      <div className="skeleton watch-player-skeleton"></div>

      <div className="watch-skeleton-info">
        {/* 2. Title */}
        <div className="skeleton watch-title-skeleton"></div>

        {/* 3. Meta (Views, Date) */}
        <div className="skeleton watch-meta-skeleton"></div>

        {/* 4. Channel and Actions Row */}
        <div className="watch-channel-row">
          <div className="skeleton watch-channel-logo"></div>
          <div className="skeleton watch-channel-text"></div>
          <div className="skeleton watch-action-btn"></div>
          <div className="skeleton watch-action-btn"></div>
          <div className="skeleton watch-action-btn"></div>
        </div>

        {/* 5. Description Box */}
        <div className="skeleton watch-description-skeleton"></div>

        {/* 6. Comments Header */}
        <div className="skeleton watch-comment-header"></div>
        
        {/* 7. Comment lines */}
        <div className="skeleton watch-comment-line"></div>
        <div className="skeleton watch-comment-line"></div>
      </div>
    </div>
  );
};

export default WatchPageSkeleton;