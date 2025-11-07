import React from "react";
import "../styles/LongVideoGrid.css";

/**
 * Renders up to 6 video thumbnails in a responsive grid.
 * You can reuse/replace thumbnail, channel, title etc.
 */

const LongVideoGrid = ({ videos = [] }) => {
  return (
    <div className="long-grid">
      {videos.map((v) => (
        <div className="long-card" key={v.id}>
          <div className="thumb-wrap">
            <img src={v.thumbnail} alt={v.title} className="thumb" />
            <span className="duration">{v.duration}</span>
          </div>
          <div className="meta">
            <div className="title">{v.title}</div>
            <div className="channel">{v.channel}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LongVideoGrid;
