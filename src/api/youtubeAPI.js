// src/api/youtubeAPI.js
import axios from "axios";

/* -------------------------------------------
   🔑 Multi API Key Rotation Setup
------------------------------------------- */
const API_KEYS = [
"AIzaSyD3Omhe6HxuPcHDLUQyPGrXBMa7-kpcOTo",
"AIzaSyDK2hOXZ3QAIeUGy76Niztl26V0oJ2_eKE",
"AIzaSyDzVHTgfXFIl8FMlQY0QcN8OGqekctwUjw",
"AIzaSyCxHN_LvucVaJXAnlgABDM78nbTBVP1Ios",
"AIzaSyC0L6TpJCXYRMKF-yaNMmmcKhp6jM9_6bQ",
"AIzaSyCgo8_8IpG2mMSRraizEEoWrNVcl8q66Wo",
"AIzaSyCROYQ4uSDQTGSCB4loSspP99uOC3bG74g",
"AIzaSyCi2F4oh6co_0TD7mA6sPFLgNgf6wUb218",
"AIzaSyA8JZTg7ZLNAHcxKi9xiKGBhmdC9qzU63c",
"AIzaSyA16JmAWY6XsindWF4L11L7yIL2ciI9dU8",
"AIzaSyDLKzIk9Q45f4AQB8ylS1ACTUbKYSJIFNQ",
"AIzaSyA9KIvUCY6YWTUvLRydnkpzJL-RnojqqV8",
"AIzaSyAdQyPI_Bx2AIcvn9wVYQRRi-R6IfWFQps",
"AIzaSyA4tMRs1z-pVo8AtUwZy66EFoz-1FP47LA",
"AIzaSyDOc3vEhibO9bAVpIhkVPJBab9MPRaT480",
"AIzaSyD9Nytt0BpmnY1OUjlZjhlzWAT2GzOG36E",
"AIzaSyA7y74bWAfYcY3QqvB9nkkuFrfQIOm90S0",       
"AIzaSyDU6-dQH0Qs_nJULWW8zv1ZS39TK4T5gMc",
"AIzaSyBLLGGLMi8Qz_4NTFJ65AaNTM8g-j0tZ2o",
"AIzaSyC-uwwoegGzxr4-Hk4B7aMrEw-znrYJNTs",


  // add more keys if needed
];

let currentKeyIndex = 0;
const BASE_URL = "https://www.googleapis.com/youtube/v3";

const getKey = () => API_KEYS[currentKeyIndex];
const switchKey = () => {
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
  console.warn(`⏩ Switched to API key #${currentKeyIndex + 1}`);
};

/* -------------------------------------------
   🧪 API GET with automatic key rotation
------------------------------------------- */
const apiGet = async (endpoint, params = {}) => {
  for (let attempt = 0; attempt < API_KEYS.length; attempt++) {
    try {
      const res = await axios.get(`${BASE_URL}/${endpoint}`, {
        params: { ...params, key: getKey() },
      });
      return res.data;
    } catch (err) {
      const code = err.response?.status;
      console.warn(`⚠️ API error on key #${currentKeyIndex + 1} (${code})`);

      if (code === 400 || code === 403 || code === 429) {
        switchKey();
        continue;
      }

      throw err;
    }
  }
  throw new Error("All YouTube API keys exhausted");
};

/* -------------------------------------------
   🔆 Fake Duration Generator
------------------------------------------- */
const generateFakeDuration = (title, realDuration = "") => {
  const t = title.toLowerCase();

  const IS_MOVIE =
    t.includes("movie") ||
    t.includes("full movie") ||
    t.includes("film") ||
    t.includes("cinema") ||
    t.includes("trailer") ||
    realDuration.includes("H");

  if (IS_MOVIE) {
    // 🎬 1.5–2.5 hours
    const hours = 1;
    const minutes = 30 + Math.floor(Math.random() * 60);
    const seconds = Math.floor(Math.random() * 60);
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }

  // 📺 5–20 minutes
  const minutes = 5 + Math.floor(Math.random() * 15);
  const seconds = Math.floor(Math.random() * 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

/* -------------------------------------------
   🧠 Fetch Channel Logo
------------------------------------------- */
const fetchChannelLogos = async (channelIds = []) => {
  if (!channelIds.length) return {};

  try {
    const data = await apiGet("channels", {
      part: "snippet",
      id: channelIds.join(","),
    });

    const map = {};
    data.items?.forEach((c) => {
      map[c.id] = c.snippet?.thumbnails?.default?.url || "";
    });

    return map;
  } catch (err) {
    return {};
  }
};

/* -------------------------------------------
   ⚙ Normalize Items (safe id extraction)
------------------------------------------- */
const normalizeItem = (v) => {
  const id =
    v.id?.videoId ||
    v.id ||
    v.resourceId?.videoId ||
    v.contentDetails?.videoId ||
    null;

  return {
    id,
    title: v.snippet?.title || "",
    channelId: v.snippet?.channelId || "",
    channelTitle: v.snippet?.channelTitle || "",
    thumbnail:
      v.snippet?.thumbnails?.medium?.url ||
      v.snippet?.thumbnails?.default?.url ||
      "",
    publishedAt: v.snippet?.publishedAt || "",
    raw: v,
  };
};

/* -------------------------------------------
   📺 Fetch YouTube Videos (Home Page)
------------------------------------------- */
export const fetchYoutubeVideos = async (query = "latest", regionCode = "IN") => {
  try {
    const data = await apiGet("search", {
      part: "snippet",
      q: query,
      type: "video",
      maxResults: 30,
      regionCode,
      videoEmbeddable: "true",
      safeSearch: "none",
    });

    const items = data.items.map(normalizeItem);
    const channelMap = await fetchChannelLogos(
      [...new Set(items.map((v) => v.channelId))]
    );

    return items.map((v) => ({
      ...v,
      channelLogo: channelMap[v.channelId] || null,
      duration: generateFakeDuration(v.title),
      views: Math.floor(Math.random() * 900000),
    }));
  } catch (err) {
    console.error("Home API failed:", err);
    return [];
  }
};

/* -------------------------------------------
   🎬 Fetch Single Video
------------------------------------------- */
export const fetchVideoById = async (videoId) => {
  if (!videoId) return null;

  try {
    const data = await apiGet("videos", {
      part: "snippet,statistics,contentDetails",
      id: videoId,
    });

    const v = data.items?.[0];
    if (!v) return null;

    return {
      id: v.id,
      title: v.snippet.title,
      description: v.snippet.description,
      channelTitle: v.snippet.channelTitle,
      channelId: v.snippet.channelId,
      categoryId: v.snippet.categoryId,
      publishedAt: v.snippet.publishedAt,
      views: v.statistics?.viewCount || 0,
      channelLogo: v.snippet?.thumbnails?.default?.url || "",
      duration: generateFakeDuration(v.snippet.title, v.contentDetails?.duration),
    };
  } catch {
    return null;
  }
};

/* -------------------------------------------
   👥 Channel Details
------------------------------------------- */
export const fetchChannelDetails = async (channelId) => {
  if (!channelId) return null;

  try {
    const data = await apiGet("channels", {
      part: "snippet,statistics",
      id: channelId,
    });

    const c = data.items?.[0];
    if (!c) return null;

    return {
      logo: c.snippet?.thumbnails?.default?.url || "",
      subscribers: c.statistics?.subscriberCount || 0,
    };
  } catch {
    return null;
  }
};

/* -------------------------------------------
   🎯 Smart Related Videos (clickable & autoplay)
------------------------------------------- */
export const fetchRelatedVideos = async (videoId, limit = 10) => {
  if (!videoId) return [];

  try {
    const main = await fetchVideoById(videoId);

    const steps = [];

    // Step 1 → Directly related vids
    try {
      const s = await apiGet("search", {
        part: "snippet",
        relatedToVideoId: videoId,
        type: "video",
        maxResults: 20,
        videoEmbeddable: "true",
      });
      steps.push(s.items.map(normalizeItem));
    } catch {}

    // Step 2 → Same category
    if (main?.categoryId) {
      try {
        const s = await apiGet("videos", {
          part: "snippet",
          chart: "mostPopular",
          regionCode: "IN",
          videoCategoryId: main.categoryId,
          maxResults: 12,
        });

        steps.push(
          s.items.map((v) =>
            normalizeItem({ id: v.id, snippet: v.snippet })
          )
        );
      } catch {}
    }

    // Step 3 → Title keywords
    try {
      const kw = main.title
        .replace(/[^a-zA-Z0-9 ]/g, " ")
        .split(" ")
        .filter((w) => w.length > 3)
        .slice(0, 5)
        .join(" ");

      const s = await apiGet("search", {
        part: "snippet",
        type: "video",
        q: kw || main.title,
        maxResults: 15,
        videoEmbeddable: "true",
      });

      steps.push(s.items.map(normalizeItem));
    } catch {}

    // Step 4 → Same channel
    if (main?.channelId) {
      try {
        const s = await apiGet("search", {
          part: "snippet",
          type: "video",
          channelId: main.channelId,
          order: "date",
          maxResults: 15,
        });
        steps.push(s.items.map(normalizeItem));
      } catch {}
    }

    // Merge + dedupe
    const seen = new Set();
    const merged = [];

    for (const arr of steps) {
      for (const v of arr) {
        if (v.id && !seen.has(v.id)) {
          seen.add(v.id);
          merged.push(v);
        }
        if (merged.length >= limit) break;
      }
    }

    const channelMap = await fetchChannelLogos(
      [...new Set(merged.map((v) => v.channelId))]
    );

    return merged.map((v) => ({
      ...v,
      channelLogo: channelMap[v.channelId] || null,
      duration: generateFakeDuration(v.title),
      views: Math.floor(Math.random() * 800000 + 15000),
    }));
  } catch {
    return [];
  }
};
