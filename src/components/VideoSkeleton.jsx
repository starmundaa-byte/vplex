// src/components/VideoSkeleton.jsx
import React from "react";

const VideoSkeleton = () => {
  return (
    <div className="video-card skeleton-card">
      {/* 1. Thumbnail placeholder */}
      <div className="skeleton skeleton-thumbnail"></div>
      
      <div className="skeleton-info">
        {/* 2. Text placeholders */}
        <div className="skeleton skeleton-text-title"></div>
        <div className="skeleton skeleton-text-short"></div>
        
        {/* 3. Channel logo placeholder (circle) */}
        <div className="skeleton channel-logo-skeleton"></div>
      </div>
    </div>
  );
};

export default VideoSkeleton;