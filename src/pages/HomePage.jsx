import React, { useEffect, useState } from "react";
import { fetchVideos } from "../api/youtube";
import VideoCard from "../components/VideoCard";
import "./HomePage.css";

/*
 Home page:
 - reads ?q= from URL automatically (fallback 'music')
 - fetches videos via api/youtube (which caches)
 - displays grid
*/

import { useSearchParams } from "react-router-dom";

export default function HomePage() {
  const [params] = useSearchParams();
  const qParam = params.get("q") || "music";

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  // simple in-memory cache per session for immediate speed
  useEffect(() => {
    let mounted = true;
    setLoading(true);

    fetchVideos(qParam, 24)
      .then(items => { if (!mounted) return; setVideos(items); })
      .catch(err => { console.error(err); if (mounted) setVideos([]); })
      .finally(() => { if (mounted) setLoading(false); });

    return () => { mounted = false; };
  }, [qParam]);

  return (
    <main className="container" style={{paddingTop:16}}>
      <div className="center small-muted" style={{marginBottom:10}}>Showing results for <strong>{qParam}</strong></div>

      {loading ? (
        <div className="center" style={{padding:30}}>Loading...</div>
      ) : (
        <div className="grid">
          {videos.map(v => <VideoCard key={v.id.videoId || v.id} video={v} />)}
        </div>
      )}
    </main>
  );
}
