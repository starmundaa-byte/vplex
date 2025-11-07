// src/api/youtubeAPI.js
import axios from "axios";

/* -------------------------------------------
   🔑 Multi API Key Rotation Setup
------------------------------------------- */
const API_KEYS = [
  "AIzaSyDK2hOXZ3QAIeUGy76Niztl26V0oJ2_eKE",
"AIzaSyDzVHTgfXFIl8FMlQY0QcN8OGqekctwUjw",
"AIzaSyCxHN_LvucVaJXAnlgABDM78nbTBVP1Ios",
"AIzaSyC0L6TpJCXYRMKF-yaNMmmcKhp6jM9_6bQ",
"AIzaSyCgo8_8IpG2mMSRraizEEoWrNVcl8q66Wo",
"AIzaSyCROYQ4uSDQTGSCB4loSspP99uOC3bG74g",
"AIzaSyCi2F4oh6co_0TD7mA6sPFLgNgf6wUb218",
"AIzaSyA8JZTg7ZLNAHcxKi9xiKGBhmdC9qzU63c",
"AIzaSyA16JmAWY6XsindWF4L11L7yIL2ciI9dU8"

  // ➕ add as many as you have
];
let currentKeyIndex = 0;
const BASE_URL = "https://www.googleapis.com/youtube/v3";

const getKey = () => API_KEYS[currentKeyIndex];
const switchKey = () => {
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
  console.warn(`⏩ Switched to next YouTube API key (#${currentKeyIndex + 1})`);
};

/* -------------------------------------------
   🧠 Helper: Fetch channel logos
------------------------------------------- */
const fetchChannelLogos = async (channelIds = []) => {
  if (!channelIds.length) return {};

  for (let attempt = 0; attempt < API_KEYS.length; attempt++) {
    try {
      const { data } = await axios.get(`${BASE_URL}/channels`, {
        params: {
          part: "snippet",
          id: channelIds.join(","),
          key: getKey(),
        },
      });

      const logos = {};
      data.items?.forEach((ch) => {
        logos[ch.id] = ch.snippet.thumbnails.default.url;
      });

      return logos;
    } catch (err) {
      console.error("⚠️ Failed to fetch channel logos:", err.message);
      if (err.response?.status === 403) switchKey();
      else break;
    }
  }
  return {};
};

/* -------------------------------------------
   📺 Fetch YouTube videos by query
------------------------------------------- */
export const fetchYoutubeVideos = async (query = "latest", regionCode = "IN") => {
  for (let attempt = 0; attempt < API_KEYS.length; attempt++) {
    try {
      console.log(`🔑 Using API key #${currentKeyIndex + 1}`);
      const { data } = await axios.get(`${BASE_URL}/search`, {
        params: {
          part: "snippet",
          q: query,
          maxResults: 30,
          regionCode,
          type: "video",
          videoEmbeddable: "true",
          key: getKey(),
        },
      });

      const videos = data.items || [];

      // 🔹 Fetch channel logos in batch
      const channelIds = [...new Set(videos.map((v) => v.snippet.channelId))];
      const channelMap = await fetchChannelLogos(channelIds);

      return videos.map((v) => ({
        id: v.id.videoId,
        title: v.snippet.title,
        thumbnail: v.snippet.thumbnails.medium.url,
        channelTitle: v.snippet.channelTitle,
        channelLogo: channelMap[v.snippet.channelId] || null,
        publishedAt: v.snippet.publishedAt,
        views: Math.floor(Math.random() * 500000),
        duration: `${Math.floor(Math.random() * 10)}:${Math.floor(Math.random() * 60)
          .toString()
          .padStart(2, "0")}`,
      }));
    } catch (error) {
      console.warn(`❌ API key ${getKey()} failed:`, error.response?.status);
      if (error.response?.status === 403) switchKey();
      else break;
    }
  }

  console.error("🚫 All YouTube API keys exhausted.");
  return [];
};

/* -------------------------------------------
   🎯 Fetch Related / Recommended Videos
------------------------------------------- */
export const fetchRelatedVideos = async (videoId, fallbackQuery = "trending") => {
  if (!videoId) {
    console.warn("⚠️ Missing videoId in fetchRelatedVideos()");
    return [];
  }

  console.log(`▶️ Fetching related videos for: ${videoId}`);

  for (let attempt = 0; attempt < API_KEYS.length; attempt++) {
    try {
      const { data } = await axios.get(`${BASE_URL}/search`, {
        params: {
          part: "snippet",
          relatedToVideoId: videoId,
          type: "video",
          maxResults: 20,
          videoEmbeddable: "true",
          safeSearch: "none",
          key: getKey(),
        },
      });

      let videos = data.items || [];

      // 🧭 Fallback to trending query if no related results
      if (videos.length === 0) {
        console.warn("⚠️ No related videos, fetching fallback query...");
        const { data: fallback } = await axios.get(`${BASE_URL}/search`, {
          params: {
            part: "snippet",
            q: fallbackQuery,
            type: "video",
            maxResults: 20,
            videoEmbeddable: "true",
            key: getKey(),
          },
        });
        videos = fallback.items || [];
      }

      // 🔹 Fetch logos
      const channelIds = [...new Set(videos.map((v) => v.snippet.channelId))];
      const channelMap = await fetchChannelLogos(channelIds);

      return videos.map((v) => ({
        id: v.id.videoId,
        title: v.snippet.title,
        thumbnail: v.snippet.thumbnails.medium.url,
        channelTitle: v.snippet.channelTitle,
        channelLogo: channelMap[v.snippet.channelId] || null,
        publishedAt: v.snippet.publishedAt,
        views: Math.floor(Math.random() * 500000),
      }));
    } catch (error) {
      console.warn(`❌ Related video fetch failed with ${getKey()}`);
      if (error.response?.status === 403) switchKey();
      else break;
    }
  }

  console.error("🚫 All YouTube API keys exhausted (related videos).");
  return [];
};

/* -------------------------------------------
   🎬 Fetch Single Video by ID
------------------------------------------- */
export const fetchVideoById = async (videoId) => {
  if (!videoId) return null;

  for (let attempt = 0; attempt < API_KEYS.length; attempt++) {
    try {
      const { data } = await axios.get(`${BASE_URL}/videos`, {
        params: {
          part: "snippet,statistics,contentDetails",
          id: videoId,
          key: getKey(),
        },
      });

      const item = data.items?.[0];
      if (!item) return null;

      return {
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        channelTitle: item.snippet.channelTitle,
        channelId: item.snippet.channelId,
        publishedAt: item.snippet.publishedAt,
        views: item.statistics?.viewCount || 0,
        channelLogo: `https://ui-avatars.com/api/?name=${encodeURIComponent(
          item.snippet.channelTitle
        )}`,
        duration: item.contentDetails?.duration || "0:00",
      };
    } catch (error) {
      console.warn(`❌ Video fetch failed with key ${getKey()}`);
      if (error.response?.status === 403) switchKey();
      else break;
    }
  }

  console.error("🚫 All API keys failed for fetchVideoById.");
  return null;
};
