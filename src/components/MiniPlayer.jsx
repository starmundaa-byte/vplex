// src/components/MiniPlayer.jsx
import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import YouTube from "react-youtube";
import { FaTimes, FaExpand } from "react-icons/fa";
import "../styles/MiniPlayer.css";

console.log("MiniPlayer mounted");

const MiniPlayer = ({ video, onClose, onMaximize }) => {
  const navigate = useNavigate();
  const [dragging, setDragging] = useState(false);
  const rootRef = useRef(null);
  const posRef = useRef({ x: 0, y: 0 });
  const startRef = useRef({ x: 0, y: 0 });

  if (!video) return null;

  // supports either video.src (mp4) or video.videoId (youtube)
  const isYouTube = !!video.videoId;

  // Make the mini player draggable (pointer events)
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const handlePointerDown = (e) => {
      setDragging(true);
      startRef.current = { x: e.clientX, y: e.clientY };
      el.setPointerCapture(e.pointerId);
    };
    const handlePointerMove = (e) => {
      if (!dragging) return;
      const dx = e.clientX - startRef.current.x;
      const dy = e.clientY - startRef.current.y;
      startRef.current = { x: e.clientX, y: e.clientY };
      posRef.current.x += dx;
      posRef.current.y += dy;
      el.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px)`;
    };
    const handlePointerUp = (e) => {
      setDragging(false);
      try { el.releasePointerCapture(e.pointerId); } catch {}
    };

    el.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      el.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [dragging]);

  const handleMaximizeClick = () => {
    // use navigate inside maximize handler to keep SPA navigation
    if (video && video.id) {
      navigate(`/watch/${video.id}`);
      if (onMaximize) onMaximize(navigate);
    }
  };

  return (
    <div
      ref={rootRef}
      className="mini-player"
      role="dialog"
      aria-label="Mini player"
    >
      <div className="mini-media">
        {isYouTube ? (
          <YouTube videoId={video.videoId} opts={{ width: "100%", height: "100%", playerVars: { autoplay: 1 } }} />
        ) : (
          <video src={video.src} controls autoPlay className="mini-video" />
        )}
      </div>

      <div className="mini-actions">
        <button className="mini-action mini-close" onClick={() => onClose && onClose()} aria-label="Close mini player">
          <FaTimes />
        </button>
        <button className="mini-action mini-max" onClick={handleMaximizeClick} aria-label="Maximize mini player">
          <FaExpand />
        </button>
      </div>
    </div>
  );
};

export default MiniPlayer;
