import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Header.css";

// 🔹 import analytics helpers
import { initGA, logPageView, logEvent } from "../utils/analytics";

const Header = ({ onSearch, onSearchReset }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestionsVisible, setSuggestionsVisible] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const recognitionRef = useRef(null);
  const headerRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Initialize GA only once on app load
  useEffect(() => {
    initGA();
    logPageView(window.location.pathname + window.location.search);
  }, []);

  // ✅ Log every route change (auto page tracking)
  useEffect(() => {
    logPageView(location.pathname + location.search);
  }, [location]);

  // ✅ Load login + searches
  useEffect(() => {
    const storedLogin = localStorage.getItem("isLoggedIn");
    if (storedLogin === "true") setIsLoggedIn(true);

    const storedSearches = JSON.parse(localStorage.getItem("recentSearches")) || [];
    setRecentSearches(storedSearches);
  }, []);

  // ✅ Global click-outside handler
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) {
        setMenuOpen(false);
        setSuggestionsVisible(false);
        setVoiceOpen(false);
        setNotificationsOpen(false);
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Handle search + track analytics
  const handleSearch = (term) => {
    if (!term.trim()) return;
    setSearchTerm(term);
    const updated = [term, ...recentSearches.filter((t) => t !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));

    // 🔹 Log search event to analytics
    logEvent("Search", "Used Search", term);

    if (location.pathname !== "/") {
      navigate("/", { state: { query: term } });
      setTimeout(() => onSearch && onSearch(term), 100);
    } else {
      onSearch && onSearch(term);
    }
    setSuggestionsVisible(false);
  };

  const handleVoiceSearch = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Voice search not supported on this browser");
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setSearchTerm(text);
      handleSearch(text);
      setVoiceOpen(false);

      // 🔹 Log voice search
      logEvent("Search", "Voice Search", text);
    };
    recognition.onerror = () => setVoiceOpen(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem("isLoggedIn", "true");

    // 🔹 Track login
    logEvent("User", "Login", "Success");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("isLoggedIn");

    // 🔹 Track logout
    logEvent("User", "Logout", "Manual");
  };

  const closeAllExcept = (target) => {
    if (target !== "menu") setMenuOpen(false);
    if (target !== "search") setSuggestionsVisible(false);
    if (target !== "voice") setVoiceOpen(false);
    if (target !== "notify") setNotificationsOpen(false);
    if (target !== "profile") setProfileOpen(false);
  };

  return (
    <>
      <header className="header" ref={headerRef}>
        {/* Menu */}
        <button
          className="icon-btn"
          onClick={() => {
            closeAllExcept("menu");
            setMenuOpen((prev) => !prev);

            // 🔹 Track menu toggle
            logEvent("Menu", "Toggle", !menuOpen ? "Open" : "Close");
          }}
        >
          ☰
        </button>

        {/* Title click behavior */}
        <h1
          className="title"
          onClick={() => {
            if (location.pathname !== "/") navigate("/");
            else if (onSearchReset) onSearchReset();

            // 🔹 Track home title click
            logEvent("Navigation", "Home Click", "Header Title");
          }}
        >
          VPLEX.in
        </h1>

        {/* Search */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => {
              closeAllExcept("search");
              setSuggestionsVisible(true);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSearch(searchTerm)}
          />
          <button className="search-btn" onClick={() => handleSearch(searchTerm)}>
            🔍
          </button>

          {suggestionsVisible && (
            <div className="suggestion-box">
              <div className="suggestion-section">
                <p className="suggestion-title">Recent Searches</p>
                {recentSearches.length === 0 && <p className="no-item">No recent searches</p>}
                {recentSearches.map((r, i) => (
                  <p key={i} onClick={() => handleSearch(r)}>
                    {r}
                  </p>
                ))}
              </div>
              <div className="suggestion-section">
                <p className="suggestion-title">Suggested</p>
                {["Music", "Gaming", "News", "Movies", "Sports"].map((s, i) => (
                  <p key={i} onClick={() => handleSearch(s)}>
                    {s}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Other buttons unchanged */}
        <button className="icon-btn" onClick={() => { closeAllExcept("voice"); setVoiceOpen(true); }}>🎤</button>
        <button className="icon-btn" onClick={() => { closeAllExcept("notify"); setNotificationsOpen((p) => !p); }}>🔔</button>
        <button className="icon-btn" onClick={() => { closeAllExcept("profile"); setProfileOpen((p) => !p); }}>👤</button>
      </header>
    </>
  );
};

export default Header;
