import React, { useEffect, useState, useRef } from "react";
import LongVideoGrid from "./LongVideoGrid";
import ShortsRow from "./ShortsRow";
import "../styles/VideoFeed.css";

/**
 * Behavior:
 * - Loads 12 long videos initially.
 * - Renders long videos in groups of 6.
 * - After the first group (6), renders a ShortsRow.
 * - After every 24 long videos (every 4 groups) renders a ShortsRow.
 * - Infinite loads 12 more long videos when user scrolls near bottom.
 */

const generateLongVideos = (startId, count) => {
  return Array.from({ length: count }).map((_, i) => {
    const id = startId + i;
    return {
      id,
      title: `Long Video #${id}`,
      channel: `Channel ${((id % 10) + 1)}`,
      duration: `${Math.floor(Math.random() * 12) + 1}:00`,
      thumbnail: `https://via.placeholder.com/400x225?text=Long+${id}`,
      category: ["Music", "Gaming", "News", "Movies", "Sports", "Tech"][
        id % 6
      ],
    };
  });
};

const generateShorts = (seed, count = 12) => {
  return Array.from({ length: count }).map((_, i) => {
    const id = `${seed}-${i}`;
    return {
      id,
      title: `Short ${seed}-${i}`,
      thumbnail: `https://via.placeholder.com/300x540?text=Short+${seed}-${i}`,
      duration: `${Math.floor(Math.random() * 0.59 * 60) + 1}s`,
    };
  });
};

const VideoFeed = () => {
  const [longVideos, setLongVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const nextIdRef = useRef(1);
  const [shortsSeed, setShortsSeed] = useState(1);

  // Initial load: 12 long videos
  useEffect(() => {
    loadMore();
    // eslint-disable-next-line
  }, []);

  // Infinite scroll listener
  useEffect(() => {
    const onScroll = () => {
      const nearBottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 700;
      if (nearBottom && !loading) {
        loadMore();
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
    // eslint-disable-next-line
  }, [loading, longVideos]);

  const loadMore = () => {
    setLoading(true);
    // simulate fetch delay
    setTimeout(() => {
      const start = nextIdRef.current;
      const newOnes = generateLongVideos(start, 12); // load 12
      nextIdRef.current = start + 12;
      setLongVideos((prev) => [...prev, ...newOnes]);
      setShortsSeed((s) => s + 1);
      setLoading(false);
    }, 400);
  };

  /**
   * Render logic:
   * - chunk longVideos into groups of 6
   * - after group 0 (the first) insert a ShortsRow
   * - after every 4 groups (i.e., after 24 videos) insert another ShortsRow
   */
  const renderBlocks = () => {
    const blocks = [];
    const groupSize = 6;
    const totalGroups = Math.ceil(longVideos.length / groupSize);

    for (let g = 0; g < totalGroups; g++) {
      const start = g * groupSize;
      const group = longVideos.slice(start, start + groupSize);

      // Long group
      blocks.push(
        <section key={`long-group-${g}`} className="long-group">
          <LongVideoGrid videos={group} />
        </section>
      );

      // Decide whether to insert a ShortsRow after this group:
      // - always after the first group (g === 0)
      // - and after every 4 groups (i.e., (g + 1) % 4 === 0)
      if (g === 0 || (g + 1) % 4 === 0) {
        // Each shorts row gets a seed so it has different content
        const seed = Math.floor((start + 1) / groupSize) + shortsSeed;
        blocks.push(
          <section key={`shorts-after-${g}`} className="shorts-section">
            <ShortsRow seed={seed} />
          </section>
        );
      }
    }

    return blocks;
  };

  return (
    <div className="video-feed-root">
      {renderBlocks()}

      {loading && (
        <div className="loading">
          <div className="loader" /> Loading more videos...
        </div>
      )}
    </div>
  );
};

export default VideoFeed;
