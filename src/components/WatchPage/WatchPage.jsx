// src/components/WatchPage/WatchPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchVideoById, fetchRelatedVideos } from "../../api/youtubeAPI";
import WatchMobile from "./WatchMobile";
import WatchDesktop from "./WatchDesktop";
import "../../styles/WatchPage.css";

export default function WatchPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 800);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 800);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    let cancel = false;

    const loadData = async () => {
      setLoading(true);
      try {
        const vid = await fetchVideoById(id);
        const rel = await fetchRelatedVideos(id);
        if (!cancel) {
          setVideo(vid);
          setRelated(rel);
        }
      } catch (err) {
        console.error("Error loading video:", err);
      } finally {
        if (!cancel) setLoading(false);
      }
    };

    if (id) loadData();
    return () => (cancel = true);
  }, [id]);

  if (loading) return <div className="watchpage-wrapper">Loading...</div>;
  if (!video) return <div className="watchpage-wrapper">Video not found</div>;

  return isMobile ? (
    <WatchMobile video={video} related={related} navigate={navigate} />
  ) : (
    <WatchDesktop video={video} related={related} navigate={navigate} />
  );
}
