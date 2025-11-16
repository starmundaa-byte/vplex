// src/components/WatchPage/WatchMobile.jsx
import React from "react";
import VideoPlayer from "./VideoPlayer";
import VideoDetails from "./VideoDetails";
import VideoAction from "./VideoActions";
import Comment from "./CommentsSection";
import RelatedVideo from "./RelatedVideos";
import "../../styles/WatchMobile.css";

export default function WatchMobile({ video, navigate }) {
  if (!video) return <p>Loading video...</p>;

  return (
    <div className="watch-mobile">

      {/* Sticky Player Wrapper */}
      <div className="player-section">
        <VideoPlayer video={video} />
      </div>

      {/* Video Title, Channel, Subscribe */}
      <VideoDetails video={video} />

      {/* Actions (Like / Share / Save) */}
      <VideoAction video={video} />

      {/* Comments */}
      <Comment videoId={video.id} />

      {/* Related videos */}
      <RelatedVideo videoId={video.id} navigate={navigate} />
    </div>
  );
}
