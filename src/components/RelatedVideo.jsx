/* -------------------------------------------
   🎯 Fetch Related / Recommended Videos
------------------------------------------- */
export const fetchRelatedVideos = async (videoId, fallbackQuery = "trending") => {
  if (!videoId) {
    console.warn("⚠️ Missing videoId in fetchRelatedVideos()");
    return [];
  }

  console.log(`▶️ Fetching related videos for: ${videoId}`);

  try {
    const { data } = await axios.get(`${BASE_URL}/search`, {
      params: {
        part: "snippet",
        relatedToVideoId: videoId,
        type: "video",
        maxResults: 30,
        videoEmbeddable: "true",
        safeSearch: "none",
        key: API_KEY,
      },
    });

    let videos = data.items || [];

    // 🧭 If no related videos are found, fallback to trending query
    if (videos.length === 0) {
      console.warn("⚠️ No related videos, fetching fallback query...");
      const { data: fallback } = await axios.get(`${BASE_URL}/search`, {
        params: {
          part: "snippet",
          q: fallbackQuery,
          type: "video",
          maxResults: 30,
          videoEmbeddable: "true",
          key: API_KEY,
        },
      });
      videos = fallback.items || [];
    }

    // 🔹 Fetch logos for the related videos
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
    console.error("❌ Error fetching related videos:", error.response?.data || error);

    // 🧩 Final fallback — popular videos
    try {
      const { data } = await axios.get(`${BASE_URL}/search`, {
        params: {
          part: "snippet",
          q: "popular videos",
          type: "video",
          maxResults: 30,
          videoEmbeddable: "true",
          key: API_KEY,
        },
      });

      return data.items.map((v) => ({
        id: v.id.videoId,
        title: v.snippet.title,
        thumbnail: v.snippet.thumbnails.medium.url,
        channelTitle: v.snippet.channelTitle,
        publishedAt: v.snippet.publishedAt,
        views: Math.floor(Math.random() * 500000),
      }));
    } catch (fallbackErr) {
      console.error("❌ Fallback also failed:", fallbackErr.message);
      return [];
    }
  }
};
