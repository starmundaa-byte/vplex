import React, { useState, useRef, useEffect } from "react";
import "../../styles/VideoPlayer.css";
import { FaWindowMinimize, FaWindowMaximize } from "react-icons/fa";

export default function VideoPlayer({ video }) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const playerRef = useRef(null);

  if (!video?.id) return null;

  // --- Dragging logic ---
  useEffect(() => {
    if (!isMinimized) return;
    const el = playerRef.current;
    let startX, startY, startLeft, startBottom, isDragging = false;

    const onMouseDown = (e) => {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      const rect = el.getBoundingClientRect();
      startLeft = window.innerWidth - rect.right + 20; // from right
      startBottom = rect.bottom - window.innerHeight + 20; // from bottom
      el.style.cursor = "grabbing";
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      setPosition({
        x: Math.max(0, startLeft - dx),
        y: Math.max(0, startBottom + dy),
      });
    };

    const onMouseUp = () => {
      isDragging = false;
      el.style.cursor = "grab";
    };

    el.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      el.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isMinimized]);

  return (
    <div
      ref={playerRef}
      className={`player-container-react ${isMinimized ? "floating-player" : ""}`}
      style={
        isMinimized
          ? {
              position: "fixed",
              bottom: `${position.y}px`,
              right: `${position.x}px`,
              width: "340px",
              height: "190px",
              zIndex: 99999,
              background: "#000",
              borderRadius: "10px",
              boxShadow: "0 4px 15px rgba(0,0,0,0.5)",
              cursor: "grab",
              transition: "all 0.25s ease",
            }
          : {}
      }
    >
      <button
        className="minmax-btn"
        onClick={() => setIsMinimized((prev) => !prev)}
        title={isMinimized ? "Maximize" : "Minimize"}
      >
        {isMinimized ? <FaWindowMaximize /> : <FaWindowMinimize />}
      </button>

      <iframe
        src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0&playsinline=1`}
        title={video.title}
        allow="autoplay; encrypted-media"
        allowFullScreen
      ></iframe>
    </div>
  );
}
