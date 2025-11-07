// src/components/ShortsRow.jsx
import React, { useRef } from "react";
import "../styles/ShortsRow.css"; // we'll provide CSS below

const ShortsRow = ({ shorts = [], onShortClick }) => {
  const containerRef = useRef(null);

  const scrollBy = (dir = "right") => {
    const el = containerRef.current;
    if (!el) return;
    const scrollAmount = Math.round(el.clientWidth * 0.8); // scroll by most of the visible width
    el.scrollBy({ left: dir === "right" ? scrollAmount : -scrollAmount, behavior: "smooth" });
  };

  return (
    <div className="shorts-row-root">
      <div className="shorts-header">
        <div className="shorts-title">
          <span className="shorts-icon">▶</span>
          <span className="shorts-label">Shorts</span>
        </div>
      </div>

      <div className="shorts-container-wrapper">
        <button className="shorts-arrow left" onClick={() => scrollBy("left")} aria-label="Scroll left">
          ‹
        </button>

        <div className="shorts-container" ref={containerRef}>
          {shorts.map((s) => (
            <div
              key={`short-${s.id}`}
              className="short-card"
              onClick={() => onShortClick && onShortClick(s)}
              role="button"
              tabIndex={0}
            >
              <div className="short-thumb-wrap">
                <img
                  src={s.thumbnail || "https://via.placeholder.com/240x426?text=No+Image"}
                  alt={s.title}
                  className="short-thumb"
                  loading="lazy"
                />
              </div>
              <div className="short-meta">
                <div className="short-title" title={s.title}>{s.title}</div>
                <div className="short-views">{s.views || "1.2K views"}</div>
              </div>
            </div>
          ))}
        </div>

        <button className="shorts-arrow right" onClick={() => scrollBy("right")} aria-label="Scroll right">
          ›
        </button>
      </div>
    </div>
  );
};

export default ShortsRow;
