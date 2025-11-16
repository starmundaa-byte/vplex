// src/api/firestoreService.js
import {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit as limitFn,
  updateDoc,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

const VIDEOS_COLLECTION = "videos";

/**
 * Save (or merge) multiple videos to Firestore.
 * - Uses videoId as the document id to avoid duplicates.
 * - Adds the provided keyword into a `keywords` array for fallback search.
 * - Uses setDoc(..., { merge: true }) so we don't overwrite existing fields.
 */
export const saveVideosToFirestore = async (videos = [], keyword = "general") => {
  try {
    if (!Array.isArray(videos) || videos.length === 0) return;

    const key = String(keyword || "general").trim().toLowerCase().replace(/\s+/g, "_");

    for (const v of videos) {
      const id = v.id || v.videoId;
      if (!id) continue;

      const docRef = doc(db, VIDEOS_COLLECTION, id);

      // Build normalized doc
      const docData = {
        videoId: id,
        title: v.title || v.snippet?.title || "",
        thumbnail:
          (v.thumbnail && v.thumbnail.url) ||
          v.snippet?.thumbnails?.medium?.url ||
          v.thumbnailUrl ||
          `https://img.youtube.com/vi/${id}/mqdefault.jpg`,
        channelTitle: v.channelTitle || v.snippet?.channelTitle || v.channel || "",
        channelId: v.channelId || v.snippet?.channelId || "",
        category: v.category || (v.snippet && v.snippet.categoryId) || "",
        description: v.description || v.snippet?.description || "",
        tags: v.tags || v.snippet?.tags || [],
        publishedAt: v.publishedAt || v.snippet?.publishedAt || null,
        updatedAt: serverTimestamp(),
      };

      // Merge doc & add keyword to keywords array
      // If document exists, update; otherwise set with merge
      await setDoc(docRef, { ...docData }, { merge: true });

      // Add keyword to keywords array for fallback search
      try {
        await updateDoc(docRef, {
          keywords: arrayUnion(key),
        });
      } catch (e) {
        // If updateDoc fails (e.g. doc unexpectedly missing) ignore — doc was set with setDoc above
      }
    }
    console.log(`✅ Saved ${videos.length} videos to Firestore (keyword: ${key})`);
  } catch (err) {
    console.error("❌ saveVideosToFirestore error:", err);
  }
};

/**
 * Fetch cached videos by keyword (fallback).
 * Looks for documents where `keywords` array contains the normalized key.
 */
export const fetchMetaVideos = async (keyword = "general", limit = 24) => {
  try {
    const key = String(keyword || "general").trim().toLowerCase().replace(/\s+/g, "_");
    const col = collection(db, VIDEOS_COLLECTION);

    // Query by keywords array
    const q = query(col, where("keywords", "array-contains", key), orderBy("updatedAt", "desc"), limitFn(limit));
    const snap = await getDocs(q);

    const results = [];
    snap.forEach((d) => {
      results.push({ id: d.id, ...d.data() });
    });

    if (results.length === 0) {
      // fallback: return a limited set of latest videos if keyword search empty
      const allQ = query(col, orderBy("updatedAt", "desc"), limitFn(limit));
      const allSnap = await getDocs(allQ);
      const fallback = [];
      allSnap.forEach((d) => fallback.push({ id: d.id, ...d.data() }));
      return fallback;
    }

    return results;
  } catch (err) {
    console.error("❌ fetchMetaVideos error:", err);
    return [];
  }
};

/**
 * Get some recent videos from Firestore (generic home fallback).
 */
export const getVideosFromFirestore = async (limit = 24) => {
  try {
    const col = collection(db, VIDEOS_COLLECTION);
    const q = query(col, orderBy("updatedAt", "desc"), limitFn(limit));
    const snap = await getDocs(q);
    const items = [];
    snap.forEach((d) => items.push({ id: d.id, ...d.data() }));
    return items;
  } catch (err) {
    console.error("❌ getVideosFromFirestore error:", err);
    return [];
  }
};

/**
 * Get related videos from Firestore (existing logic adapted)
 */
export const getRelatedFirestoreVideos = async (videoId, maxResults = 12) => {
  try {
    if (!videoId) return [];

    const currentSnap = await getDoc(doc(db, VIDEOS_COLLECTION, videoId));
    if (!currentSnap.exists()) {
      console.warn("⚠️ No Firestore document found for video:", videoId);
      return [];
    }

    const current = currentSnap.data();
    const channelId = current.channelId || "";
    const category = current.category || "";
    const tags = Array.isArray(current.tags) ? current.tags : [];

    const runQuery = async (q) => {
      const snap = await getDocs(q);
      const items = [];
      snap.forEach((d) => {
        if (d.id === videoId) return;
        items.push({ id: d.id, ...d.data() });
      });
      return items;
    };

    const col = collection(db, VIDEOS_COLLECTION);
    const queries = [];

    if (channelId) {
      queries.push(runQuery(query(col, where("channelId", "==", channelId), limitFn(6))));
    }
    if (category) {
      queries.push(runQuery(query(col, where("category", "==", category), limitFn(6))));
    }
    if (tags.length > 0) {
      const tagSlice = tags.slice(0, 10);
      queries.push(runQuery(query(col, where("tags", "array-contains-any", tagSlice), limitFn(8))));
    }

    if (queries.length === 0) return [];

    const results = await Promise.all(queries);
    const merged = results.flat();

    // Deduplicate preserving order
    const map = new Map();
    merged.forEach((v) => {
      if (!map.has(v.id)) map.set(v.id, v);
    });

    return Array.from(map.values()).slice(0, maxResults);
  } catch (err) {
    console.error("❌ getRelatedFirestoreVideos error:", err);
    return [];
  }
};
