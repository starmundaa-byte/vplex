import React from "react";
import { Link } from "react-router-dom";
import "./videocard.css";

/*
 Expects video shape from search API item:
 item.id.videoId, item.snippet.title, item.snippet.thumbnails.medium.url
*/

export default function VideoCard({ video }) {
  const videoId = video.id?.videoId || video.id;
  const snip = video.snippet || {};
  const thumb = (snip.thumbnails && (snip.thumbnails.medium?.url || snip.thumbnails.default?.url)) || "";

  return (
    <Link to={`/watch/${videoId}`} className="v-card-link">
      <div className="v-card">
        <div className="v-thumb-wrap">
          <img src={thumb} alt={snip.title} className="v-thumb" loading="lazy" />
        </div>
        <div className="v-meta">
          <div className="v-title">{snip.title}</div>
          <div className="small-muted">{snip.channelTitle}</div>
        </div>
      </div>
    </Link>
  );
}
