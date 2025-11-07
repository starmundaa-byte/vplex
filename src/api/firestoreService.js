// ✅ src/api/firestoreService.js
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  query,
  where,
  limit as limitFn,
} from "firebase/firestore";
import { db } from "../firebase";

const COLLECTION = "videos";

/**
 * 💾 Save multiple videos to Firestore
 */
export const saveVideosToFirestore = async (videos) => {
  try {
    const videosRef = collection(db, COLLECTION);
    for (const v of videos) {
      await addDoc(videosRef, v);
    }
  } catch (error) {
    console.error("❌ Error saving to Firestore:", error);
  }
};

/**
 * 📥 Get all videos from Firestore
 */
export const getVideosFromFirestore = async () => {
  try {
    const snapshot = await getDocs(collection(db, COLLECTION));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("❌ Error fetching from Firestore:", error);
    return [];
  }
};

/**
 * 🔎 Get related videos from Firestore
 * Strategy:
 *  - Find the current video doc (by ID)
 *  - Fetch videos from the same channel, category, or matching tags
 *  - Combine & deduplicate
 */
export const getRelatedFirestoreVideos = async (videoId, maxResults = 12) => {
  try {
    if (!videoId) return [];

    // 🧩 1. Get current video data
    const currentSnap = await getDoc(doc(db, COLLECTION, videoId));
    if (!currentSnap.exists()) {
      console.warn("⚠️ No Firestore document found for video:", videoId);
      return [];
    }

    const current = currentSnap.data();
    const channelId = current.channelId || "";
    const category = current.category || "";
    const tags = Array.isArray(current.tags) ? current.tags : [];

    // Helper to run and map query results
    const runQuery = async (q) => {
      const snap = await getDocs(q);
      const items = [];
      snap.forEach((d) => {
        if (d.id === videoId) return; // skip current video
        const data = d.data();
        items.push({
          id: d.id,
          title: data.title || "",
          thumbnail: data.thumbnail || data.thumbnailUrl || "",
          channelTitle: data.channelTitle || "",
          channelLogo: data.channelLogo || "",
          publishedAt: data.publishedAt || "",
          views: data.views || 0,
          category: data.category || "",
          tags: data.tags || [],
        });
      });
      return items;
    };

    // 🧠 2. Build queries
    const queries = [];

    if (channelId) {
      queries.push(
        runQuery(
          query(collection(db, COLLECTION), where("channelId", "==", channelId), limitFn(6))
        )
      );
    }

    if (category) {
      queries.push(
        runQuery(
          query(collection(db, COLLECTION), where("category", "==", category), limitFn(6))
        )
      );
    }

    if (tags.length > 0) {
      const tagSlice = tags.slice(0, 10); // Firestore max for array-contains-any
      queries.push(
        runQuery(
          query(
            collection(db, COLLECTION),
            where("tags", "array-contains-any", tagSlice),
            limitFn(8)
          )
        )
      );
    }

    if (queries.length === 0) {
      console.warn("⚠️ No valid query fields (channel/category/tags) for related videos");
      return [];
    }

    // 🧩 3. Run all queries in parallel
    const results = await Promise.all(queries);
    const merged = results.flat();

    // 🧹 4. Deduplicate
    const uniqueMap = new Map();
    merged.forEach((v) => {
      if (!uniqueMap.has(v.id)) uniqueMap.set(v.id, v);
    });

    const final = Array.from(uniqueMap.values()).slice(0, maxResults);
    return final;
  } catch (error) {
    console.error("❌ Error fetching related Firestore videos:", error);
    return [];
  }
};
