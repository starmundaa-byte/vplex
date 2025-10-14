// Minimal YouTube helper with simple localStorage caching.
// Caching: stores under key 'vplex_cache_<key>' with expiry timestamp.

const API_KEY = import.meta.env.VITE_YT_API_KEY;
const BASE = "https://www.googleapis.com/youtube/v3";

function cacheSet(key, data, ttlSeconds = 300) {
  const payload = { ts: Date.now(), ttl: ttlSeconds * 1000, data };
  try { localStorage.setItem("vplex_cache_" + key, JSON.stringify(payload)); } catch {}
}
function cacheGet(key) {
  try {
    const raw = localStorage.getItem("vplex_cache_" + key);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    if (Date.now() - obj.ts > obj.ttl) { localStorage.removeItem("vplex_cache_" + key); return null; }
    return obj.data;
  } catch { return null; }
}

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("YT fetch failed: " + res.status);
  return res.json();
}

// search videos (returns array of items as returned from API)
export async function fetchVideos(query = "music", maxResults = 24) {
  const key = `search_${query}_${maxResults}`;
  const cached = cacheGet(key);
  if (cached) return cached;

  const url = `${BASE}/search?part=snippet&type=video&maxResults=${maxResults}&q=${encodeURIComponent(query)}&key=${API_KEY}`;
  const data = await fetchJSON(url);
  const items = data.items || [];
  cacheSet(key, items, 300); // cache 5 minutes
  return items;
}

// fetch full video (snippet + statistics)
export async function fetchVideoById(id) {
  const key = `video_${id}`;
  const cached = cacheGet(key);
  if (cached) return cached;

  const url = `${BASE}/videos?part=snippet,statistics,contentDetails&id=${id}&key=${API_KEY}`;
  const data = await fetchJSON(url);
  const item = data.items && data.items[0] ? data.items[0] : null;
  if (item) cacheSet(key, item, 300);
  return item;
}
