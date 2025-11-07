import React from "react";
import "../../styles/WatchMobileTablet.css";

const WatchShorts = ({ video }) => {
  const videoId = video.id?.videoId || video.id;
  return (
    <div className="shorts-container">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1`}
        title={video.snippet?.title}
        frameBorder="0"
        allowFullScreen
      ></iframe>
      <h3 className="shorts-title">{video.snippet?.title}</h3>
    </div>
  );
};

export default WatchShorts;
