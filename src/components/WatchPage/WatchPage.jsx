// src/components/WatchPage/WatchPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchVideoById, fetchRelatedVideos } from "../../api/youtubeAPI";
import WatchLongMobile from "./WatchLongMobile";
import WatchLongDesktop from "./WatchLongDesktop";
import "../../styles/WatchPage.css";

export default function WatchPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 800);

  // Handle responsive switch
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 800);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        // Fetch main video using centralized API
        const mainVideo = await fetchVideoById(id);
        if (!cancelled && mainVideo) setVideo(mainVideo);

        // Fetch related videos using centralized API
        const relVideos = await fetchRelatedVideos(id, mainVideo?.title || "trending");
        if (!cancelled) setRelated(relVideos || []);
      } catch (err) {
        console.error("Error fetching video:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (id) load();
    return () => (cancelled = true);
  }, [id]);

  if (!id) return <div className="watchpage-wrapper">No video selected.</div>;
  if (loading) return <div className="watchpage-wrapper">Loading...</div>;
  if (!video) return <div className="watchpage-wrapper">Video not found.</div>;

  return isMobile ? (
    <WatchLongMobile video={video} related={related} />
  ) : (
    <WatchLongDesktop video={video} related={related} navigate={navigate} />
  );
}
