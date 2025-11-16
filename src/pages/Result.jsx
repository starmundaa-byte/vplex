// src/pages/Result.jsx
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Header from "../components/Header";
import VideoFeed from "../components/VideoFeed";
import ShortsRow from "../components/ShortsRow";
import { fetchYoutubeVideos } from "../api/youtubeAPI";
import "../styles/Home.css"; // reuse layout

const Result = () => {
  const location = useLocation();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  // Extract ?q= or ?category= from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get("q");
    const category = params.get("category");
    const keyword = search || category || "";

    setQuery(keyword);
    setLoading(true);

    // Fetch results
    fetchYoutubeVideos(keyword)
      .then((data) => {
        setVideos(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [location.search]);

  return (
    <>
      <Header />
      <div className="home-container">
        {loading ? (
          <p style={{ color: "white", textAlign: "center", marginTop: "80px" }}>
            Loading results...
          </p>
        ) : (
          <>
            <h2
              style={{
                color: "white",
                paddingLeft: "16px",
                paddingTop: "80px",
                fontSize: "18px",
              }}
            >
              Results for: <span style={{ color: "#0ff" }}>{query}</span>
            </h2>

            <div className="content-section">
              {videos.map((video, index) => (
                <React.Fragment key={video.id}>
                  <VideoFeed videos={[video]} />
                  {/* after every 8 videos add a ShortsRow */}
                  {(index + 1) % 6 === 0 && (
                    <div style={{ margin: "20px 0" }}>
                      <ShortsRow />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Result;
