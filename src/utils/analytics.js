// src/utils/analytics.js
import ReactGA from "react-ga4";

const MEASUREMENT_ID = "G-3EV8FT3QM6"; // your GA4 ID

// -----------------------------------------------------
// 1️⃣  INITIALIZATION
// -----------------------------------------------------
export const initGA = () => {
  if (!window._gaInitialized) {
    ReactGA.initialize(MEASUREMENT_ID);
    window._gaInitialized = true;
    console.log("✅ Google Analytics initialized");
    enableAutoScrollTracking();
    startTimeOnPageTimer();
    window.addEventListener("beforeunload", () => trackUserLeave());
  }
};

// -----------------------------------------------------
// 2️⃣  BASIC TRACKERS
// -----------------------------------------------------
export const logPageView = (path) => {
  if (!path) path = window.location.pathname + window.location.search;
  ReactGA.send({ hitType: "pageview", page: path });
  console.log("📄 Page view logged:", path);
};

export const logEvent = (category, action, label, value) => {
  try {
    ReactGA.event({ category, action, label, value });
    console.log("🎯 Event logged:", { category, action, label, value });
  } catch (err) {
    console.error("❌ GA event error:", err);
  }
};

// -----------------------------------------------------
// 3️⃣  USER ACTIONS
// -----------------------------------------------------
export const trackUserLogin = (method = "manual") => logEvent("User", "Login", method);
export const trackUserLogout = () => logEvent("User", "Logout");
export const trackUserSignup = (method = "email") => logEvent("User", "Signup", method);

// -----------------------------------------------------
// 4️⃣  SEARCH / CATEGORY
// -----------------------------------------------------
export const trackSearch = (term) => logEvent("Search", "Keyword", term);
export const trackVoiceSearch = (term) => logEvent("Search", "Voice", term);
export const trackCategoryClick = (category) => logEvent("Category", "Click", category);

// -----------------------------------------------------
// 5️⃣  VIDEO EVENTS
// -----------------------------------------------------
export const trackVideoPlay = (videoId) => logEvent("Video", "Play", videoId);
export const trackVideoPause = (videoId, time) =>
  logEvent("Video", "Pause", `${videoId} @${time}s`);
export const trackVideoSkip = (videoId, time) =>
  logEvent("Video", "Skip", `${videoId} @${time}s`);
export const trackVideoWatchTime = (videoId, seconds) =>
  logEvent("Video", "Watch Time", videoId, seconds);
export const trackFullWatch = (videoId) => logEvent("Video", "Full Watch", videoId);
export const trackRelatedVideoClick = (videoId) =>
  logEvent("Video", "Related Click", videoId);

// -----------------------------------------------------
// 6️⃣  ENGAGEMENT (likes, shares, ads, etc.)
// -----------------------------------------------------
export const trackLike = (videoId) => logEvent("Engagement", "Like", videoId);
export const trackDislike = (videoId) => logEvent("Engagement", "Dislike", videoId);
export const trackShare = (videoId, platform) =>
  logEvent("Engagement", "Share", platform);
export const trackAdClick = (adName) => logEvent("Engagement", "Ad Click", adName);
export const trackMenuClick = (menuName) =>
  logEvent("Navigation", "Menu Click", menuName);

// -----------------------------------------------------
// 7️⃣  PAGE TIME + SCROLL DEPTH
// -----------------------------------------------------
let startTime = Date.now();

export const startTimeOnPageTimer = () => {
  startTime = Date.now();
  console.log("⏱️ Page timer started");
};

export const trackTimeOnPage = (page, seconds) =>
  logEvent("Page", "Time Spent", page, seconds);

export const trackUserLeave = () => {
  const seconds = Math.round((Date.now() - startTime) / 1000);
  trackTimeOnPage(window.location.pathname, seconds);
  logEvent("Page", "Exit", window.location.pathname);
  console.log("👋 User left page after", seconds, "seconds");
};

let lastDepth = 0;
export const enableAutoScrollTracking = () => {
  window.addEventListener("scroll", () => {
    const scrollTop = window.scrollY;
    const docHeight = document.body.scrollHeight - window.innerHeight;
    const scrolled = Math.round((scrollTop / docHeight) * 100);
    if (scrolled - lastDepth >= 25) {
      lastDepth = scrolled;
      logEvent("Scroll", "Depth", `${Math.min(100, scrolled)}%`);
    }
  });
  console.log("📊 Auto-scroll tracking enabled");
};

// -----------------------------------------------------
// 8️⃣  OPTIONAL HELPERS (can be used anywhere)
// -----------------------------------------------------
export const trackButtonClick = (label) => logEvent("UI", "Button Click", label);
export const trackMostClickedItem = (itemName) =>
  logEvent("UI", "Most Clicked", itemName);
