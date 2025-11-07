import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import CategoryBar from "../components/Category";
import "../styles/Home.css";
import { fetchYoutubeVideos } from "../api/youtubeAPI";
import { saveVideosToFirestore, getVideosFromFirestore } from "../api/firestoreService";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [resetTrigger, setResetTrigger] = useState(Date.now());
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const navigate = useNavigate();

  // ✅ Initial Load
  useEffect(() => {
    loadVideos("latest", true);
  }, []);

  const loadVideos = async (query, replace = false) => {
    try {
      const apiVideos = await fetchYoutubeVideos(query);
      if (replace) {
        setVideos(apiVideos);
        setFilteredVideos(apiVideos);
      } else {
        setVideos((prev) => [...prev, ...apiVideos]);
        setFilteredVideos((prev) => [...prev, ...apiVideos]);
      }
      saveVideosToFirestore(apiVideos);
    } catch (err) {
      console.error("⚠️ YouTube API failed, loading cached:", err);
      const backup = await getVideosFromFirestore();
      if (replace) {
        setVideos(backup);
        setFilteredVideos(backup);
      } else {
        setVideos((prev) => [...prev, ...backup]);
        setFilteredVideos((prev) => [...prev, ...backup]);
      }
    } finally {
      setIsLoadingMore(false);
    }
  };

  // ✅ Infinite Scroll (auto fetch new videos continuously)
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop + 200 >=
        document.documentElement.offsetHeight
      ) {
        if (!isLoadingMore) {
          setIsLoadingMore(true);
          loadVideos(selectedCategory === "All" ? "latest" : selectedCategory);
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isLoadingMore, selectedCategory]);

  // ✅ Category Filter
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    if (category === "All") loadVideos("latest", true);
    else loadVideos(category, true);
  };

  // ✅ Search
  const handleSearch = (query) => {
    if (!query.trim()) return;
    setSelectedCategory("All");
    loadVideos(query, true);
  };

  // ✅ Reset
  const handleSearchReset = () => {
    setSelectedCategory("All");
    setResetTrigger(Date.now());
    loadVideos("latest", true);
  };

  // ✅ Watch navigation
  const handleVideoClick = (video) => {
    navigate(`/watch/${video.id}`, { state: { video } });
  };

  // ✅ Format views
  const formatViews = (num) => {
    if (!num) return "0 views";
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + "B views";
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M views";
    if (num >= 1_000) return (num / 1_000).toFixed(1) + "K views";
    return num + " views";
  };

  // ✅ Time ago calculation
  const timeAgo = (dateString) => {
    if (!dateString) return "";
    const now = new Date();
    const past = new Date(dateString);
    const diff = (now - past) / 1000;
    const days = diff / (60 * 60 * 24);
    if (days < 1) return "Today";
    if (days < 7) return `${Math.floor(days)} day${days > 1 ? "s" : ""} ago`;
    if (days < 30) return `${Math.floor(days / 7)} week${days / 7 > 1 ? "s" : ""} ago`;
    if (days < 365) return `${Math.floor(days / 30)} month${days / 30 > 1 ? "s" : ""} ago`;
    return `${Math.floor(days / 365)} year${days / 365 > 1 ? "s" : ""} ago`;
  };

  return (
    <>
      <Header onSearch={handleSearch} onSearchReset={handleSearchReset} />
      <div className="sticky-category-wrapper">
        <CategoryBar onCategoryChange={handleCategoryChange} resetTrigger={resetTrigger} />
      </div>

      <main className="home-container">
        <section className="content-section">
          {filteredVideos.length > 0 ? (
            filteredVideos.map((v) => (
              <div key={v.id + Math.random()} className="video-card" onClick={() => handleVideoClick(v)}>
                {/* ✅ Thumbnail with duration */}
                <div className="thumbnail-wrapper">
                  <img
                    src={v.thumbnail || "https://via.placeholder.com/320x180?text=No+Image"}
                    alt={v.title}
                    className="video-thumbnail"
                  />
                  {v.duration && <span className="duration">{v.duration}</span>}
                </div>

                <div className="video-details">
                  <h3 className="video-title">{v.title}</h3>
                  <div className="video-meta">
                    <span className="views">{formatViews(v.views)}</span> •{" "}
                    <span className="time">{timeAgo(v.publishedAt)}</span>
                  </div>
                  <div className="channel-info">
                    <img
                      src={v.channelLogo || "https://via.placeholder.com/36"}
                      alt={v.channelTitle}
                      className="channel-logo"
                    />
                    <p className="channel-name">{v.channelTitle}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p style={{ textAlign: "center", width: "100%" }}>Loading videos...</p>
          )}
          {isLoadingMore && (
            <p style={{ textAlign: "center", width: "100%", margin: "20px 0" }}>
              Loading more videos...
            </p>
          )}
        </section>
      </main>
    </>
  );
};

export default Home;
