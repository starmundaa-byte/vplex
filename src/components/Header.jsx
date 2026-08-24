// Updated Header.jsx with category reset on search
import React, { useState, useEffect, useRef, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Header.css";
import { initGA, logPageView, logEvent } from "../utils/analytics";
import { UserContext } from "../main";
import { signInWithGoogle, signOutUser } from "../api/USER";
import DownloadButton from "./DownloadButton";
import DeveloperPopup from "./DeveloperPopup"; // 👈 ADD

const Header = ({ onSearch, onSearchReset, onCategoryReset }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestionsVisible, setSuggestionsVisible] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [developerPopupOpen, setDeveloperPopupOpen] = useState(false); // 👈 ADD

  const [isSearchActive, setIsSearchActive] = useState(false);
  const recognitionRef = useRef(null);
  const headerRef = useRef(null);

  const { user, setUser } = useContext(UserContext);
  const isLoggedIn = !!user;

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    initGA();
    logPageView(window.location.pathname + window.location.search);
  }, []);

  useEffect(() => {
    logPageView(location.pathname + location.search);
  }, [location]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("recentSearches")) || [];
    setRecentSearches(stored);
  }, []);

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

  const performSearch = (term) => {
    if (!term.trim()) return;

    if (onCategoryReset) {
      onCategoryReset();
    }

    const updated = [term, ...recentSearches.filter((t) => t !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));

    logEvent("Search", "Used Search", term);

    if (location.pathname !== "/") {
      navigate("/", { state: { query: term } });
      setTimeout(() => onSearch && onSearch(term), 100);
    } else {
      onSearch && onSearch(term);
    }

    setSuggestionsVisible(false);
    setIsSearchActive(false);
  };

  const handleSearchButton = () => {
    if (isSearchActive) {
      if (searchTerm.trim()) performSearch(searchTerm);
    } else {
      setIsSearchActive(true);
      setSuggestionsVisible(true);
    }
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
      performSearch(text);
      setVoiceOpen(false);
      logEvent("Search", "Voice Search", text);
    };

    recognition.onerror = () => setVoiceOpen(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleLogin = async () => {
    try {
      const loggedUser = await signInWithGoogle();
      setUser(loggedUser);
      logEvent("User", "Login", "GoogleSuccess");
    } catch (e) {
      alert("Login failed");
    }
  };

  const handleLogout = async () => {
    try {
      await signOutUser();
      setUser(null);
      logEvent("User", "Logout", "GoogleSignOut");
    } catch (e) {}
  };

  const closeAllExcept = (target) => {
    if (target !== "menu") setMenuOpen(false);
    if (target !== "search") setSuggestionsVisible(false);
    if (target !== "voice") setVoiceOpen(false);
    if (target !== "notify") setNotificationsOpen(false);
    if (target !== "profile") setProfileOpen(false);
  };

  // 👇 ADD THIS FUNCTION
  const openDeveloperPopup = () => {
    setMenuOpen(false);
    setDeveloperPopupOpen(true);
  };

  return (
    <header className="header" ref={headerRef}>
      {isSearchActive && (
        <button className="icon-btn back-btn" onClick={() => { setIsSearchActive(false); setSearchTerm(""); setSuggestionsVisible(false); }}>
          ←
        </button>
      )}

      {/* 👇 UPDATED MENU BUTTON WITH DROPDOWN */}
      {!isSearchActive && (
        <div className="menu-wrapper">
          <button 
            className="icon-btn menu-btn" 
            onClick={() => {
              closeAllExcept("menu");
              setMenuOpen((prev) => !prev);
            }}
            aria-label="Menu"
          >
            <span className="menu-icon">
              <span className="menu-line"></span>
              <span className="menu-line"></span>
              <span className="menu-line"></span>
            </span>
          </button>

          {/* Menu Dropdown */}
          {menuOpen && (
            <div className="menu-dropdown">
              <div className="menu-dropdown-item" onClick={() => { 
                setMenuOpen(false); 
                navigate('/'); 
              }}>
                🏠 Home
              </div>
              <div className="menu-dropdown-item" onClick={() => { 
                setMenuOpen(false); 
                navigate('/download'); 
              }}>
                📥 Downloads
              </div>
              <div className="menu-dropdown-divider"></div>
              <div className="menu-dropdown-item" onClick={openDeveloperPopup}>
                👨‍💻 Developer
              </div>
              <div className="menu-dropdown-item" onClick={() => { 
                setMenuOpen(false); 
                window.open('https://github.com/yourusername', '_blank'); 
              }}>
                🐙 GitHub
              </div>
            </div>
          )}
        </div>
      )}

      {!isSearchActive && (
        <h1 className="title" onClick={() => {
          if (location.pathname !== "/") navigate("/");
          else if (onSearchReset) onSearchReset();
        }}>
          <div className="brand">
            <img 
              src="/logo.png" 
              alt="Vplex" 
              className="logo" 
              style={{ width: '28px', height: '28px' }}
            />
            <span className="logo-text" style={{ fontSize: '16px' }}>
              VPLEX<span className="domain" style={{ fontSize: '11px' }}>.in</span>
            </span>
          </div>
        </h1>
      )}

      {/* SEARCH BAR */}
      <div className={`search-bar ${isSearchActive ? "active" : ""}`}>
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => {
            setIsSearchActive(true);
            setSuggestionsVisible(true);
            closeAllExcept("search");
          }}
          onKeyDown={(e) => e.key === "Enter" && searchTerm.trim() && performSearch(searchTerm)}
        />

        <button className="search-btn" onClick={handleSearchButton}>
          🔍
        </button>

        {suggestionsVisible && (
          <div className="suggestion-box">
            <div className="suggestion-section">
              <p className="suggestion-title">Recent Searches</p>
              {recentSearches.length === 0 && <p className="no-item">No recent searches</p>}
              {recentSearches.map((r, i) => (
                <p key={i} onClick={() => performSearch(r)}>{r}</p>
              ))}
            </div>

            <div className="suggestion-section">
              <p className="suggestion-title">Suggested</p>
              {["Music", "Gaming", "News", "Movies", "Sports"].map((s, i) => (
                <p key={i} onClick={() => performSearch(s)}>{s}</p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* RIGHT ICONS */}
      {isSearchActive ? (
        <button className="icon-btn" onClick={() => setVoiceOpen(true)}>🎤</button>
      ) : (
        <>
          <button className="icon-btn" onClick={() => setVoiceOpen(true)}>🎤</button>

          <button className="icon-btn" onClick={() => {
            closeAllExcept("notify");
            setNotificationsOpen((p) => !p);
          }}>🔔</button>

          <DownloadButton />

          <button className="icon-btn" onClick={() => {
            closeAllExcept("profile");
            setProfileOpen((p) => !p);
          }}>
            {isLoggedIn && user?.photoURL ? (
              <img src={user.photoURL} style={{ width: "28px", height: "28px", borderRadius: "50%" }} />
            ) : (
              "👤"
            )}
          </button>

          {profileOpen && (
            <div className="profile-menu">
              {isLoggedIn ? (
                <>
                  <p style={{ color: "#0ff", fontSize: "14px" }}>{user.displayName}</p>
                  <button onClick={handleLogout}>Logout</button>
                </>
              ) : (
                <button onClick={handleLogin}>Login with Google</button>
              )}
            </div>
          )}
        </>
      )}

      {/* 👇 ADD DEVELOPER POPUP */}
      <DeveloperPopup 
        isOpen={developerPopupOpen} 
        onClose={() => setDeveloperPopupOpen(false)} 
      />
    </header>
  );
};

export default Header;