import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchRelatedVideos } from "../../api/youtubeAPI";
import "../../styles/RelatedVideo.css";

export default function RelatedVideos({ videoId }) {
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!videoId) return;
    const load = async () => {
      setLoading(true);
      const data = await fetchRelatedVideos(videoId);
      setRelatedVideos(data);
      setLoading(false);
    };
    load();
  }, [videoId]);

  function formatDuration(text) {
    return text;
  }

  if (loading) {
    return (
      <div className="related-videos">
        <p className="loading">Loading related videos...</p>
      </div>
    );
  }

  if (!relatedVideos.length) {
    return (
      <div className="related-videos">
        <p className="no-related">No related videos found.</p>
      </div>
    );
  }

  return (
    <div className="related-videos">
      {relatedVideos.map((vid) => (
        <div
          key={vid.id}
          className="related-video-card"
          onClick={() => navigate(`/watch/${vid.id}`)}
        >
          {/* Thumbnail wrapper FULL WIDTH */}
          <div className="related-thumb-wrapper">
            <img
              src={vid.thumbnail}
              alt={vid.title}
              className="related-thumb"
              loading="lazy"
            />

            {vid.duration && (
              <span className="related-duration">
                {formatDuration(vid.duration)}
              </span>
            )}
          </div>

          {/* Info BELOW thumbnail */}
          <div className="related-info">
            <p className="related-title">{vid.title}</p>

            <div className="related-meta">
              <div className="related-channel">
                {vid.channelLogo && (
                  <img
                    src={vid.channelLogo}
                    className="related-channel-logo"
                    alt=""
                  />
                )}
                <span>{vid.channelTitle}</span>
              </div>

              <p className="related-views">
                {Math.floor(vid.views / 1000)}K views
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
