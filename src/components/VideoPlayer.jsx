import React, { useState, useRef, useEffect } from "react";
import YouTube from "react-youtube";
import { useNavigate } from "react-router-dom";
import {
  FaRegWindowMinimize,
  FaWindowMaximize,
  FaTimes,
} from "react-icons/fa";
import "../styles/VideoPlayer.css";

const VideoPlayer = ({ src, isShort, videoId, onVideoEnd }) => {
  const [isMini, setIsMini] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [nextVideo, setNextVideo] = useState(null);

  const playerRef = useRef(null);
  const navigate = useNavigate();
  const isYouTube = !!videoId;

  const handleMinimize = () => {
    setIsMini(true);
    navigate("/"); // Go to home/result page
  };

  const handleMaximize = () => {
    setIsMini(false);
    navigate(`/watch/${videoId || "video"}`); // Return to watch page
  };

  const handleDismiss = () => {
    setIsMini(false);
    navigate("/"); // Just close mini player
  };

  // ✅ YouTube player options (disable end-screen & related videos)
  const opts = {
    width: "100%",
    height: "100%",
    playerVars: {
      autoplay: 1,
      rel: 0, // ✅ disables related videos at end
      modestbranding: 1,
      showinfo: 0,
      iv_load_policy: 3, // ✅ hides video annotations & overlays
      controls: 1,
    },
  };

  // --- ✅ Detect when YouTube video ends ---
  const onPlayerStateChange = (event) => {
    if (event.data === 0) {
      // Video ended
      if (onVideoEnd) onVideoEnd();

      // Example of next video (you can later set real one from props or state)
      const fakeNext = {
        id: "abc123",
        title: "Next Awesome Video",
        thumbnail: "https://picsum.photos/400/225?random=9",
      };
      setNextVideo(fakeNext);
      setShowOverlay(true);

      // Start countdown for autoplay
      let time = 5;
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
        time--;
        if (time === 0) {
          clearInterval(timer);
          handleNextVideo();
        }
      }, 1000);
    }
  };

  // --- ✅ Handle local video end ---
  const handleEnded = () => {
    if (onVideoEnd) onVideoEnd();
  };

  // --- ✅ Autoplay the next video ---
  const handleNextVideo = () => {
    if (nextVideo) {
      setShowOverlay(false);
      navigate(`/watch/${nextVideo.id}`);
    }
  };

  return (
    <div
      className={`video-player ${isShort ? "shorts-mode" : ""} ${
        isMini ? "mini" : ""
      }`}
      onDoubleClick={isMini ? handleMaximize : undefined}
    >
      <div className="video-wrapper">
        {/* --- Player Controls --- */}
        <div className="player-controls">
          {isMini ? (
            <>
              <button
                className="control-btn dismiss left"
                onClick={handleDismiss}
              >
                <FaTimes />
              </button>
              <button
                className="control-btn transparent"
                onClick={handleMaximize}
              >
                <FaWindowMaximize />
              </button>
            </>
          ) : (
            <button
              className="control-btn transparent"
              onClick={handleMinimize}
            >
              <FaRegWindowMinimize />
            </button>
          )}
        </div>

        {/* --- Video Source --- */}
        {isYouTube ? (
          <YouTube
            ref={playerRef}
            videoId={videoId}
            opts={opts}
            onStateChange={onPlayerStateChange}
          />
        ) : (
          <video
            src={src}
            controls
            autoPlay
            playsInline
            onEnded={handleEnded}
            className="video-element"
          />
        )}

        {/* --- ✅ Custom End-Screen Overlay --- */}
        {showOverlay && (
          <div className="video-overlay">
            <div className="next-video-box">
              <img src={nextVideo?.thumbnail} alt={nextVideo?.title} />
              <div className="overlay-text">
                <h4>Up next: {nextVideo?.title}</h4>
                <p>Autoplaying in {countdown}s...</p>
                <button onClick={handleNextVideo}>Play Now</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
