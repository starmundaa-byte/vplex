// src/components/WatchPage/WatchDesktop.jsx
import React from "react";
import VideoPlayer from "./VideoPlayer";
import VideoDetails from "./VideoDetails";
import VideoActions from "./VideoActions";
import CommentsSection from "./CommentsSection";
import RelatedVideos from "./RelatedVideos";
import "../../styles/WatchDesktop.css";

export default function WatchDesktop({ video, related }) {
  return (
    <div className="watch-desktop">

      <div className="left-section">
        <div className="player-sticky">
          <VideoPlayer video={video} />
        </div>

        <VideoDetails video={video} />
        <VideoActions video={video} />
        <CommentsSection videoId={video.id} />
      </div>

      <div className="right-section">
        {/* FIX: pass videoId instead of related */}
        <RelatedVideos videoId={video.id} />
      </div>

    </div>
  );
}
