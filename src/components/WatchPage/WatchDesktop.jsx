// src/components/WatchPage/WatchDesktop.jsx
import React from "react";
import VideoPlayer from "./VideoPlayer";
import VideoDetails from "./VideoDetails";
import VideoActions from "./VideoActions";
import CommentsSection from "./CommentsSection";
import RelatedVideos from "./RelatedVideos";
import WatchBannerAd from "../ads/WatchBannerAds";
import RelatedFeedAd from "../ads/RelatedFeedAds";
import "../../styles/WatchDesktop.css";

export default function WatchDesktop({ video, searchContext = [] }) {
  if (!video) return null;

  return (
    <div className="watch-desktop">
      <div className="left-section">
        <div className="player-sticky">
          <VideoPlayer video={video} />
        </div>

        <WatchBannerAd />

        <VideoDetails video={video} />
        <VideoActions video={video} />
        <CommentsSection videoId={video.id} />
      </div>

      <div className="right-section">
        <RelatedFeedAd />
        <RelatedVideos videoId={video.id} searchContext={searchContext} />
      </div>
    </div>
  );
}
