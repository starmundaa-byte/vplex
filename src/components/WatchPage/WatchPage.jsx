// src/components/WatchPage/WatchPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchVideoById, fetchRelatedVideos } from "../../api/youtubeAPI";
import WatchMobile from "./WatchMobile";
import WatchDesktop from "./WatchDesktop";
import WatchPageSkeleton from "../WatchPageSkeleton";
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
        // ✅ 1. Fetch ONLY the video first (fast)
        const vid = await fetchVideoById(id);

        if (cancel) return;

        // ✅ 2. Immediately set the video and show the player
        setVideo(vid);
        setLoading(false);

        // ✅ 3. Fetch related videos in the background (do not block the player)
        const rel = await fetchRelatedVideos(id);
        if (!cancel) setRelated(rel);

      } catch (err) {
        console.error("Error loading video:", err);
        if (!cancel) setLoading(false);
      }
    };

    if (id) loadData();
    return () => (cancel = true);
  }, [id]);

  // ✅ SKELETON ONLY SHOWS WHILE FETCHING THE MAIN VIDEO
  if (loading) return <WatchPageSkeleton />;
  
  if (!video) return <div className="watchpage-wrapper">Video not found</div>;

  return isMobile ? (
    <WatchMobile video={video} related={related} navigate={navigate} />
  ) : (
    <WatchDesktop video={video} related={related} navigate={navigate} />
  );
}