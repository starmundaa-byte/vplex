// src/components/WatchPage/RelatedVideos.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchRelatedVideos } from "../../api/youtubeAPI";
import { mergeRelatedFeeds } from "../../utils/MergeRelatedFeed"; // ⬅ NEW
import "../../styles/RelatedVideo.css";

export default function RelatedVideos({ videoId, searchContext = [] }) {
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!videoId) return;

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        // 1️⃣ Fetch content-based recommendations
        const contentBased = await fetchRelatedVideos(videoId, 20);

        // 2️⃣ Merge with search context (3:1 interleave)
        const merged = mergeRelatedFeeds(
          contentBased,
          searchContext,
          videoId,
          20
        );

        if (!cancelled) {
          setRelatedVideos(Array.isArray(merged) ? merged : []);
        }
      } catch (err) {
        console.error("[RelatedVideos] fetch failed:", err);
        if (!cancelled) setRelatedVideos([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [videoId, searchContext]);

  /* ---------- Formatters ---------- */

  function formatViews(views) {
    const n = Number(views) || 0;
    if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B views`;
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M views`;
    if (n >= 1_000) return `${Math.floor(n / 1_000)}K views`;
    return `${n} views`;
  }

  function formatDuration(text) {
    return text || "";
  }

  /* ---------- Loading / Empty states ---------- */

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

  /* ---------- Render ---------- */

  return (
    <div className="related-videos">
      {relatedVideos.map((vid) => (
        <div
          key={vid.id}
          className="related-video-card"
          data-source={vid.source}   // ⬅ for debugging (inspect element)
          onClick={() => navigate(`/watch/${vid.id}`)}
        >
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

              <p className="related-views">{formatViews(vid.views)}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
