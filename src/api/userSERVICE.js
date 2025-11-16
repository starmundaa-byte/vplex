// src/api/userService.js
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
} from "firebase/auth";
import { db, auth } from "../firebase"; // ✅ import initialized auth

const provider = new GoogleAuthProvider();

/** Initialize persistent login */
export const initAuthPersistence = async () => {
  try {
    await setPersistence(auth, browserLocalPersistence);
  } catch (err) {
    console.warn("⚠️ Could not set auth persistence:", err);
  }
};

/** Sign-in with Google */
export const signInWithGoogle = async () => {
  try {
    const res = await signInWithPopup(auth, provider);
    const user = res.user;
    await createUserIfNotExists(user);
    return user;
  } catch (err) {
    console.error("❌ Google sign-in failed:", err);
    throw err;
  }
};

/** Sign out */
export const signOutUser = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (err) {
    console.error("❌ Sign out failed:", err);
  }
};

/** Auth state listener */
export const onAuthChange = (cb) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      await createUserIfNotExists(user);
      cb(user);
    } else {
      cb(null);
    }
  });
};

/** Create user doc if not exists */
export const createUserIfNotExists = async (user) => {
  if (!user?.uid) return;
  try {
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        uid: user.uid,
        displayName: user.displayName || "",
        email: user.email || "",
        photoURL: user.photoURL || "",
        createdAt: serverTimestamp(),
      });
    }
  } catch (err) {
    console.error("❌ createUserIfNotExists error:", err);
  }
};

/** Watch history */
export const addToWatchHistory = async (uid, video) => {
  try {
    if (!uid || !video?.id) return;
    const ref = doc(db, "users", uid, "watchHistory", video.id);
    await setDoc(ref, {
      videoId: video.id,
      title: video.title || "",
      thumbnail: video.thumbnail || "",
      watchedAt: serverTimestamp(),
    });
  } catch (err) {
    console.error("❌ addToWatchHistory error:", err);
  }
};

/** Watch later */
export const addToWatchLater = async (uid, video) => {
  try {
    if (!uid || !video?.id) return;
    const ref = doc(db, "users", uid, "watchLater", video.id);
    await setDoc(ref, {
      videoId: video.id,
      title: video.title || "",
      thumbnail: video.thumbnail || "",
      addedAt: serverTimestamp(),
    });
  } catch (err) {
    console.error("❌ addToWatchLater error:", err);
  }
};

export const removeFromWatchLater = async (uid, videoId) => {
  try {
    if (!uid || !videoId) return;
    const ref = doc(db, "users", uid, "watchLater", videoId);
    await deleteDoc(ref);
  } catch (err) {
    console.error("❌ removeFromWatchLater error:", err);
  }
};

/** Likes */
export const addLike = async (uid, video) => {
  try {
    if (!uid || !video?.id) return;
    const ref = doc(db, "users", uid, "likedVideos", video.id);
    await setDoc(ref, {
      videoId: video.id,
      title: video.title || "",
      thumbnail: video.thumbnail || "",
      likedAt: serverTimestamp(),
    });
  } catch (err) {
    console.error("❌ addLike error:", err);
  }
};

export const removeLike = async (uid, videoId) => {
  try {
    if (!uid || !videoId) return;
    const ref = doc(db, "users", uid, "likedVideos", videoId);
    await deleteDoc(ref);
  } catch (err) {
    console.error("❌ removeLike error:", err);
  }
};

/** Simple fetch helpers */
export const getUserWatchLater = async (uid) => {
  try {
    if (!uid) return [];
    const col = collection(db, "users", uid, "watchLater");
    const snap = await getDocs(col);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error("❌ getUserWatchLater error:", err);
    return [];
  }
};

export const getUserLikes = async (uid) => {
  try {
    if (!uid) return [];
    const col = collection(db, "users", uid, "likedVideos");
    const snap = await getDocs(col);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error("❌ getUserLikes error:", err);
    return [];
  }
};
