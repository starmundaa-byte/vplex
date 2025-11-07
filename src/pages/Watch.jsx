// src/pages/Watch.jsx
import React from "react";
import { useParams } from "react-router-dom";
import "../styles/Watch.css";

const Watch = () => {
  const { id } = useParams();

  if (!id) {
    return (
      <div className="watch-page">
        <h2>No video selected</h2>
      </div>
    );
  }

  return (
    <div className="watch-page">
      <div className="watch-player-container">
        <iframe
          src={`https://www.youtube.com/embed/${id}?autoplay=1`}
          title="YouTube video player"
          frameBorder="0"
          allow="autoplay; encrypted-media"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
};

export default Watch;
