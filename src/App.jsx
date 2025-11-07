import React, { useState, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import WatchPage from "./components/WatchPage/WatchPage";
import MiniPlayer from "./components/MiniPlayer";

function AppInner() {
  const navigate = useNavigate();
  const homeRef = useRef(null); // ✅ reference to Home functions
  const [miniPlayer, setMiniPlayer] = useState({ active: false, video: null });

  const handleMinimize = (video) => {
    setMiniPlayer({ active: true, video });
    navigate("/");
  };
  const handleCloseMini = () => setMiniPlayer({ active: false, video: null });
  const handleMaximize = () => {
    if (miniPlayer.video?.id) {
      navigate(`/watch/${miniPlayer.video.id}`);
      setMiniPlayer({ active: false, video: null });
    }
  };

  // ✅ handlers passed to Header
  const handleSearch = (query) => homeRef.current?.handleSearch(query);
  const handleSearchReset = () => homeRef.current?.handleSearchReset();

  return (
    <>
      <Header onSearch={handleSearch} onSearchReset={handleSearchReset} />
      <div className="app-content">
        <Routes>
          <Route path="/" element={<Home ref={homeRef} />} />
          <Route path="/watch/:id" element={<WatchPage onMinimize={handleMinimize} />} />
        </Routes>
      </div>
      {miniPlayer.active && (
        <MiniPlayer video={miniPlayer.video} onClose={handleCloseMini} onMaximize={handleMaximize} />
      )}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppInner />
    </Router>
  );
}
