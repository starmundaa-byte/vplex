import React, { useEffect, useRef, useState } from "react";
import "../styles/Category.css";

const categories = [
  "All", "Music", "Gaming", "News", "Movies", "Sports", "Live", "Podcasts",
  "Technology", "Education", "Travel", "Fashion", "Comedy", "Food", "Science"
];

const CategoryBar = ({ onCategoryChange, resetTrigger }) => {
  const [active, setActive] = useState("All");
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const scrollRef = useRef(null);

  // ✅ Reset when user searches or page refresh
  useEffect(() => {
    setActive("All");
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ left: 0, behavior: "smooth" }); // scroll back to start
    }
    if (onCategoryChange) onCategoryChange("All"); // show all videos again
  }, [resetTrigger]);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setShowLeftArrow(el.scrollLeft > 5);
    setShowRightArrow(el.scrollWidth - el.scrollLeft - el.clientWidth > 5);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    el.addEventListener("scroll", checkScroll);
    return () => el.removeEventListener("scroll", checkScroll);
  }, []);

  const handleScroll = (dir) => {
    const el = scrollRef.current;
    const scrollAmount = 200;
    el.scrollBy({ left: dir === "left" ? -scrollAmount : scrollAmount, behavior: "smooth" });
  };

  const handleCategoryClick = (cat) => {
    setActive(cat);
    onCategoryChange(cat);
  };

  return (
    <div className="category-bar-container">
      {showLeftArrow && (
        <button className="scroll-arrow left" onClick={() => handleScroll("left")}>
          ‹
        </button>
      )}

      <div className="category-bar" ref={scrollRef}>
        {categories.map((cat) => (
          <div
            key={cat}
            className={`category-item ${active === cat ? "active" : ""}`}
            onClick={() => handleCategoryClick(cat)}
          >
            {cat}
          </div>
        ))}
      </div>

      {showRightArrow && (
        <button className="scroll-arrow right" onClick={() => handleScroll("right")}>
          ›
        </button>
      )}
    </div>
  );
};

export default CategoryBar;
