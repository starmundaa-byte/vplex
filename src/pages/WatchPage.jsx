import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchVideoById } from "../api/youtube";
import "./WatchPage.css";

/*
 Watch page:
 - fetches video metadata (cached)
 - shows iframe embed with autoplay=1
*/

export default function WatchPage() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchVideoById(id)
      .then(item => { if (!mounted) return; setVideo(item); })
      .catch(err => { console.error(err); if (mounted) setVideo(null); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => (mounted = false);
  }, [id]);

  if (loading) return <div className="container center" style={{padding:30}}>Loading...</div>;
  if (!video) return <div className="container center" style={{padding:30}}>Video not found</div>;

  const snip = video.snippet || {};

  return (
    <main className="container" style={{paddingTop:16}}>
      <div style={{display:"flex",gap:20,flexDirection:"column"}}>
        <div className="player-wrap">
          <iframe
            title={snip.title}
            src={`https://www.youtube.com/embed/${id}?autoplay=1&rel=0`}
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
            className="player-iframe"
          />
        </div>

        <div style={{paddingTop:12}}>
          <h1 style={{margin:0,fontSize:18,fontWeight:700}}>{snip.title}</h1>
          <div className="small-muted" style={{marginTop:6}}>{snip.channelTitle}</div>
          <div style={{marginTop:12,whiteSpace:"pre-wrap",color:"#d9d9d9"}}>{snip.description}</div>

          <Link to="/" className="link" style={{display:"inline-block",marginTop:18}}>⬅ Back to Home</Link>
        </div>
      </div>
    </main>
  );
}
