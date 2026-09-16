// src/components/WatchPage/WatchPage.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { fetchVideoById } from "../../api/youtubeAPI";
import WatchMobile from "./WatchMobile";
import WatchDesktop from "./WatchDesktop";
import WatchPageSkeleton from "../WatchPageSkeleton";
import "../../styles/WatchPage.css";

export default function WatchPage() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 800);

  // 📱 Responsive detection
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 800);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 🎬 Load the video
  useEffect(() => {
    let cancel = false;

    const loadData = async () => {
      setLoading(true);
      try {
        const vid = await fetchVideoById(id);
        if (cancel) return;
        setVideo(vid);
      } catch (err) {
        console.error("Error loading video:", err);
      } finally {
        if (!cancel) setLoading(false);
      }
    };

    if (id) loadData();
    return () => {
      cancel = true;
    };
  }, [id]);

  // 💾 Read search context from sessionStorage (set by Result page)
  const searchContext = useMemo(() => {
    try {
      return JSON.parse(
        sessionStorage.getItem("vplex:lastSearchResults") || "[]"
      );
    } catch {
      return [];
    }
  }, [id]);

  // ✅ Skeleton only while fetching the main video
  if (loading) return <WatchPageSkeleton />;

  if (!video) {
    return <div className="watchpage-wrapper">Video not found</div>;
  }

  return isMobile ? (
    <WatchMobile video={video} searchContext={searchContext} />
  ) : (
    <WatchDesktop video={video} searchContext={searchContext} />
  );
}
