// ============================================================
// VPLEX V2 - HOME PAGE
// ============================================================
//
// CURRENT FEED ARCHITECTURE
// ------------------------------------------------------------
// Whatever feed the user is currently viewing is stored as:
//
//     vplex:current-feed
//
// Examples:
//
//     Home
//     Search results
//     Category results
//
// All use the SAME current-feed storage.
//
// FLOW:
//
//     Feed loaded
//          ↓
//     Current Feed
//          ↓
//     MemoryStore
//          ↓
//     IndexedDB
//          ↓
//     Watch
//          ↓
//     Browser Back
//          ↓
//     Restore Current Feed
//
// IMPORTANT:
// ------------------------------------------------------------
// Back restoration NEVER calls YouTube API.
// Back restoration NEVER calls Firestore.
//
// Firestore remains part of the existing V2 data system.
// ============================================================

import React, {
  useEffect,
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";

import { useNavigate } from "react-router-dom";

import CategoryBar from "../components/Category";
import VideoSkeleton from "../components/VideoSkeleton";

import "../styles/Home.css";

import { fetchYoutubeVideos } from "../api/youtubeAPI";

import {
  saveVideosToFirestore,
  getVideosFromFirestore,
} from "../api/firestoreService";

import SessionManager from "../services/session/SessionManager";


// ============================================================
// CURRENT FEED ID
// ============================================================

const CURRENT_FEED_ID =
  SessionManager.CURRENT_FEED_ID;


// ============================================================
// HOME
// ============================================================

const Home = forwardRef((props, ref) => {

  const navigate = useNavigate();


  // ==========================================================
  // STATE
  // ==========================================================

  const [videos, setVideos] =
    useState([]);

  const [filteredVideos, setFilteredVideos] =
    useState([]);

  const [resetTrigger, setResetTrigger] =
    useState(Date.now());

  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const [isLoadingMore, setIsLoadingMore] =
    useState(false);

  const [showSkeleton, setShowSkeleton] =
    useState(true);

  const [apiLimitReached, setApiLimitReached] =
    useState(false);


  // ==========================================================
  // REFS
  // ==========================================================

  const currentQueryRef =
    useRef("latest");

  const currentCategoryRef =
    useRef("All");

  const mountedRef =
    useRef(false);

  const restoringFeedRef =
    useRef(false);

  const scrollSaveTimerRef =
    useRef(null);

  const loadingMoreRef =
    useRef(false);

  const navigatingToWatchRef =
    useRef(false);


  // ==========================================================
  // CREATE CURRENT FEED
  // ==========================================================

  const createCurrentFeed = (override = {}) => {

    return {

      pageType: "feed",

      type:
        override.type ||
        "home",

      query:
        override.query ??
        currentQueryRef.current ??
        "latest",

      category:
        override.category ??
        currentCategoryRef.current ??
        selectedCategory ??
        "All",

      videos:
        override.videos ??
        videos,

      filteredVideos:
        override.filteredVideos ??
        filteredVideos,

      scrollY:
        override.scrollY ??
        window.scrollY,

      updatedAt:
        Date.now(),

    };

  };


  // ==========================================================
  // SAVE CURRENT FEED
  // ==========================================================

  const saveCurrentFeed = async (
    override = {}
  ) => {

    if (!mountedRef.current && !override.force) {

      console.warn(
        "[Vplex Feed] Save skipped - Home not mounted"
      );

      return null;

    }

    const feed =
      createCurrentFeed(override);

    try {

      const saved =
        await SessionManager.saveCurrentFeed(
          feed
        );

      console.log(
        "💾 [Vplex Feed] Current feed saved:",
        {
          type: feed.type,
          query: feed.query,
          category: feed.category,
          videos: feed.videos?.length || 0,
          scrollY: feed.scrollY,
        }
      );

      return saved;

    } catch (error) {

      console.error(
        "❌ [Vplex Feed] Current feed save failed:",
        error
      );

      return null;

    }

  };


  // ==========================================================
  // RESTORE CURRENT FEED
  // ==========================================================

  useEffect(() => {

    let cancelled = false;

    const restoreFeed = async () => {

      restoringFeedRef.current = true;

      try {

        console.log(
          "🔄 [Vplex Feed] Looking for current feed..."
        );

        const feed =
          await SessionManager.restoreCurrentFeed();


        if (cancelled) {
          return;
        }


        // ====================================================
        // CURRENT FEED FOUND
        // ====================================================

        if (
          feed &&
          Array.isArray(feed.videos) &&
          feed.videos.length > 0
        ) {

          console.log(
            "⚡ [Vplex Feed] Restoring current feed:",
            {
              type: feed.type,
              query: feed.query,
              category: feed.category,
              videos: feed.videos.length,
              scrollY: feed.scrollY,
            }
          );


          // --------------------------------------------------
          // Restore video data
          // --------------------------------------------------

          setVideos(
            feed.videos
          );

          setFilteredVideos(
            Array.isArray(feed.filteredVideos) &&
            feed.filteredVideos.length > 0
              ? feed.filteredVideos
              : feed.videos
          );


          // --------------------------------------------------
          // Restore category
          // --------------------------------------------------

          const restoredCategory =
            feed.category || "All";

          setSelectedCategory(
            restoredCategory
          );

          currentCategoryRef.current =
            restoredCategory;


          // --------------------------------------------------
          // Restore query
          // --------------------------------------------------

          currentQueryRef.current =
            feed.query || "latest";


          // --------------------------------------------------
          // Feed exists - DON'T CALL API
          // --------------------------------------------------

          setShowSkeleton(false);

          setApiLimitReached(false);


          // --------------------------------------------------
          // Restore scroll
          // --------------------------------------------------

          const savedScroll =
            Number(feed.scrollY) || 0;


          requestAnimationFrame(() => {

            requestAnimationFrame(() => {

              if (cancelled) {
                return;
              }

              console.log(
                "📍 [Vplex Feed] Restoring scroll:",
                savedScroll
              );

              SessionManager.restoreCurrentFeedScroll({
                attempts: 20,
                interval: 100,
              });

            });

          });


          return;

        }


        // ====================================================
        // NO CURRENT FEED
        // ====================================================

        console.log(
          "ℹ️ [Vplex Feed] No current feed found."
        );


        if (!cancelled) {

          await loadVideos(
            "latest",
            true,
            "home"
          );

        }

      } catch (error) {

        console.error(
          "❌ [Vplex Feed] Restore failed:",
          error
        );


        if (!cancelled) {

          await loadVideos(
            "latest",
            true,
            "home"
          );

        }

      } finally {

        setTimeout(() => {

          restoringFeedRef.current =
            false;

        }, 500);

      }

    };


    restoreFeed();


    return () => {

      cancelled = true;

    };

  }, []);


  // ==========================================================
  // MOUNT
  // ==========================================================

  useEffect(() => {

    mountedRef.current = true;

    return () => {

      mountedRef.current = false;

    };

  }, []);


  // ==========================================================
  // SAVE SCROLL POSITION
  // ==========================================================

  useEffect(() => {

    const handleScroll = () => {

      if (
        restoringFeedRef.current
      ) {
        return;
      }


      if (
        scrollSaveTimerRef.current
      ) {

        clearTimeout(
          scrollSaveTimerRef.current
        );

      }


      scrollSaveTimerRef.current =
        setTimeout(() => {

          if (!mountedRef.current) {
            return;
          }


          saveCurrentFeed({
            scrollY: window.scrollY,
          });

        }, 500);

    };


    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      }
    );


    return () => {

      window.removeEventListener(
        "scroll",
        handleScroll
      );


      if (
        scrollSaveTimerRef.current
      ) {

        clearTimeout(
          scrollSaveTimerRef.current
        );

        scrollSaveTimerRef.current =
          null;

      }

    };

  }, []);


  // ==========================================================
  // LOAD VIDEOS
  // ==========================================================

  const loadVideos = async (
    query,
    replace = false,
    feedType = "home"
  ) => {

    // --------------------------------------------------------
    // Prevent duplicate infinite-scroll requests
    // --------------------------------------------------------

    if (
      !replace &&
      loadingMoreRef.current
    ) {

      return;

    }


    if (!replace) {

      loadingMoreRef.current =
        true;

      setIsLoadingMore(true);

    }


    try {

      // ------------------------------------------------------
      // Skeleton
      // ------------------------------------------------------

      if (replace) {

        setShowSkeleton(true);

      }


      setApiLimitReached(false);


      // ------------------------------------------------------
      // Update current query
      // ------------------------------------------------------

      currentQueryRef.current =
        query;


      // ======================================================
      // YOUTUBE API
      // ======================================================

      const apiVideos =
        await fetchYoutubeVideos(
          query
        );


      if (!Array.isArray(apiVideos)) {

        throw new Error(
          "Invalid video data received from YouTube API"
        );

      }


      // ======================================================
      // REPLACE CURRENT FEED
      // ======================================================

      if (replace) {

        setVideos(
          apiVideos
        );

        setFilteredVideos(
          apiVideos
        );


        // ----------------------------------------------------
        // Save the NEW current feed
        // ----------------------------------------------------

        await SessionManager.saveCurrentFeed({

          type:
            feedType,

          query,

          category:
            currentCategoryRef.current,

          videos:
            apiVideos,

          filteredVideos:
            apiVideos,

          scrollY:
            0,

        });


        console.log(
          "💾 [Vplex Feed] New current feed created:",
          {
            type: feedType,
            query,
            category:
              currentCategoryRef.current,
            videos:
              apiVideos.length,
            scrollY: 0,
          }
        );

      }


      // ======================================================
      // APPEND TO CURRENT FEED
      // ======================================================

      else {

        // ----------------------------------------------------
        // Build merged video list
        // ----------------------------------------------------

        const mergedVideos =
          Array.from(
            new Map(
              [
                ...videos,
                ...apiVideos,
              ].map(
                (video) => [
                  video.id,
                  video,
                ]
              )
            ).values()
          );


        setVideos(
          mergedVideos
        );

        setFilteredVideos(
          mergedVideos
        );


        // ----------------------------------------------------
        // Save expanded current feed
        // ----------------------------------------------------

        await SessionManager.saveCurrentFeed({

          type:
            feedType,

          query:
            currentQueryRef.current,

          category:
            currentCategoryRef.current,

          videos:
            mergedVideos,

          filteredVideos:
            mergedVideos,

          scrollY:
            window.scrollY,

        });


        console.log(
          "📚 [Vplex Feed] Current feed expanded:",
          mergedVideos.length
        );

      }


      // ======================================================
      // EXISTING FIRESTORE SAVE
      // ======================================================

      try {

        const firestoreResult =
          saveVideosToFirestore(
            apiVideos
          );


        if (
          firestoreResult &&
          typeof firestoreResult.catch ===
            "function"
        ) {

          firestoreResult.catch(
            (error) => {

              console.warn(
                "⚠️ Firestore save failed:",
                error
              );

            }
          );

        }

      } catch (error) {

        console.warn(
          "⚠️ Firestore save failed:",
          error
        );

      }

    } catch (error) {

      console.error(
        "⚠️ YouTube API failed:",
        error
      );


      // ======================================================
      // CURRENT FEED FALLBACK
      // ======================================================

      try {

        const cachedFeed =
          await SessionManager.restoreCurrentFeed();


        if (
          cachedFeed &&
          Array.isArray(cachedFeed.videos) &&
          cachedFeed.videos.length > 0
        ) {

          console.log(
            "💾 [Vplex Feed] Using current-feed fallback"
          );


          if (replace) {

            setVideos(
              cachedFeed.videos
            );

            setFilteredVideos(
              cachedFeed.filteredVideos ||
              cachedFeed.videos
            );


            setSelectedCategory(
              cachedFeed.category ||
              "All"
            );


            currentCategoryRef.current =
              cachedFeed.category ||
              "All";


            currentQueryRef.current =
              cachedFeed.query ||
              query;

          }


          setShowSkeleton(false);

          return;

        }

      } catch (sessionError) {

        console.warn(
          "⚠️ Current-feed fallback failed:",
          sessionError
        );

      }


      // ======================================================
      // FIRESTORE FALLBACK
      // ======================================================

      try {

        const backup =
          await getVideosFromFirestore();


        if (
          Array.isArray(backup) &&
          backup.length > 0
        ) {

          console.log(
            "☁️ [Vplex Feed] Using Firestore fallback"
          );


          setVideos(
            backup
          );

          setFilteredVideos(
            backup
          );


          await SessionManager.saveCurrentFeed({

            type:
              feedType,

            query:
              currentQueryRef.current,

            category:
              currentCategoryRef.current,

            videos:
              backup,

            filteredVideos:
              backup,

            scrollY:
              window.scrollY,

          });

        } else {

          setApiLimitReached(true);

        }

      } catch (firestoreError) {

        console.error(
          "❌ Firestore fallback failed:",
          firestoreError
        );

        setApiLimitReached(true);

      }

    } finally {

      if (replace) {

        setShowSkeleton(false);

      }

      setIsLoadingMore(false);

      loadingMoreRef.current =
        false;

    }

  };


  // ==========================================================
  // AUTO RETRY
  // ==========================================================

  useEffect(() => {

    if (!apiLimitReached) {
      return;
    }


    const timer =
      setTimeout(() => {

        setApiLimitReached(false);

        loadVideos(
          currentQueryRef.current,
          true,
          "home"
        );

      }, 15000);


    return () => {

      clearTimeout(timer);

    };

  }, [
    apiLimitReached,
  ]);


  // ==========================================================
  // INFINITE SCROLL
  // ==========================================================

  useEffect(() => {

    const handleScroll = () => {

      const scrollPosition =
        window.innerHeight +
        window.scrollY;

      const pageHeight =
        document.documentElement.offsetHeight;


      if (
        scrollPosition + 200 >=
        pageHeight
      ) {

        if (
          !loadingMoreRef.current &&
          !showSkeleton &&
          !apiLimitReached
        ) {

          loadVideos(
            currentQueryRef.current,
            false,
            "home"
          );

        }

      }

    };


    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      }
    );


    return () => {

      window.removeEventListener(
        "scroll",
        handleScroll
      );

    };

  }, [
    showSkeleton,
    apiLimitReached,
  ]);


  // ==========================================================
  // CATEGORY CHANGE
  // ==========================================================

  const handleCategoryChange = (
    category
  ) => {

    const query =
      category === "All"
        ? "latest"
        : category;


    currentCategoryRef.current =
      category;

    currentQueryRef.current =
      query;


    setSelectedCategory(
      category
    );

    setShowSkeleton(true);

    setApiLimitReached(false);


    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });


    loadVideos(
      query,
      true,
      "category"
    );

  };


  // ==========================================================
  // SEARCH
  // ==========================================================

  const handleSearch = (
    query
  ) => {

    if (
      !query ||
      !query.trim()
    ) {

      return;

    }


    const cleanQuery =
      query.trim();


    currentCategoryRef.current =
      "All";

    currentQueryRef.current =
      cleanQuery;


    setSelectedCategory(
      "All"
    );

    setShowSkeleton(true);

    setApiLimitReached(false);


    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });


    loadVideos(
      cleanQuery,
      true,
      "search"
    );

  };


  // ==========================================================
  // RESET TO HOME
  // ==========================================================

  const handleSearchReset = () => {

    console.log(
      "🔄 [Vplex Feed] Switching to Home feed"
    );


    currentCategoryRef.current =
      "All";

    currentQueryRef.current =
      "latest";


    setVideos([]);

    setFilteredVideos([]);

    setSelectedCategory(
      "All"
    );

    setShowSkeleton(true);

    setApiLimitReached(false);


    setResetTrigger(
      Date.now()
    );


    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });


    // --------------------------------------------------------
    // IMPORTANT:
    //
    // Do NOT delete current feed here.
    //
    // The new Home feed will replace it after loading.
    // --------------------------------------------------------

    loadVideos(
      "latest",
      true,
      "home"
    );

  };


  // ==========================================================
  // WATCH NAVIGATION
  // ==========================================================

  const handleVideoClick = async (
    video
  ) => {

    if (!video?.id) {
      return;
    }


    const scrollY =
      window.scrollY;


    console.log(
      "📍 [Vplex Feed] Saving exact position:",
      scrollY
    );


    // --------------------------------------------------------
    // Final save before Watch
    // --------------------------------------------------------

    const savedFeed =
      await saveCurrentFeed({

        scrollY,

        force: true,

      });


    if (!savedFeed) {

      console.error(
        "❌ [Vplex Feed] Could not save current feed."
      );

      return;

    }


    console.log(
      "🚀 [Vplex Feed] Current feed confirmed. Opening Watch:",
      video.id
    );


    navigatingToWatchRef.current =
      true;


    navigate(
      `/watch/${video.id}`,
      {
        state: {

          video,

          from: "home",

          sessionId:
            CURRENT_FEED_ID,

          scrollY,

        },
      }
    );

  };


  // ==========================================================
  // EXPOSE TO APP.JSX
  // ==========================================================

  useImperativeHandle(
    ref,
    () => ({

      handleSearch,

      handleSearchReset,

      handleCategoryChange,

      saveSession:
        saveCurrentFeed,

      getSession:
        async () => {

          return SessionManager.restoreCurrentFeed();

        },

    }),
    [
      videos,
      filteredVideos,
      selectedCategory,
    ]
  );


  // ==========================================================
  // FORMAT VIEWS
  // ==========================================================

  const formatViews = (
    num
  ) => {

    if (!num) {
      return "0 views";
    }


    if (
      num >= 1_000_000_000
    ) {

      return (
        (num / 1_000_000_000)
          .toFixed(1) +
        "B views"
      );

    }


    if (
      num >= 1_000_000
    ) {

      return (
        (num / 1_000_000)
          .toFixed(1) +
        "M views"
      );

    }


    if (
      num >= 1_000
    ) {

      return (
        (num / 1_000)
          .toFixed(1) +
        "K views"
      );

    }


    return (
      num +
      " views"
    );

  };


  // ==========================================================
  // TIME AGO
  // ==========================================================

  const timeAgo = (
    dateString
  ) => {

    if (!dateString) {
      return "";
    }


    const now =
      new Date();

    const past =
      new Date(
        dateString
      );

    const diff =
      (now - past) / 1000;

    const days =
      diff / (60 * 60 * 24);


    if (days < 1) {
      return "Today";
    }


    if (days < 7) {

      return (
        `${Math.floor(days)} day${
          days > 1
            ? "s"
            : ""
        } ago`
      );

    }


    if (days < 30) {

      return (
        `${Math.floor(days / 7)} week${
          days / 7 > 1
            ? "s"
            : ""
        } ago`
      );

    }


    if (days < 365) {

      return (
        `${Math.floor(days / 30)} month${
          days / 30 > 1
            ? "s"
            : ""
        } ago`
      );

    }


    return (
      `${Math.floor(days / 365)} year${
        days / 365 > 1
          ? "s"
          : ""
      } ago`
    );

  };


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <>

      <div className="sticky-category-wrapper">

        <CategoryBar
          onCategoryChange={
            handleCategoryChange
          }
          resetTrigger={
            resetTrigger
          }
        />

      </div>


      <main className="home-container">

        <section className="content-section">

          {/* ==================================================
              SKELETON
          ================================================== */}

          {showSkeleton ? (

            Array.from({
              length: 12,
            }).map(
              (_, index) => (

                <VideoSkeleton
                  key={
                    `skeleton-${index}`
                  }
                />

              )
            )

          ) : apiLimitReached ? (

            /* =================================================
               API LIMIT
            ================================================= */

            <div className="maintenance-state">

              <div className="maintenance-icon">
                🔧
              </div>


              <h3>
                Taking a quick break
              </h3>


              <p>
                We're fetching fresh content
                just for you. Please wait a
                few seconds and we'll be right
                back!
              </p>


              <div className="retry-loader">
              </div>


              <p className="retry-text">
                Retrying automatically in
                15 seconds...
              </p>

            </div>

          ) : filteredVideos.length > 0 ? (

            /* =================================================
               VIDEO FEED
            ================================================= */

            filteredVideos.map(
              (v) => (

                <div
                  key={v.id}
                  className="video-card"
                  onClick={() =>
                    handleVideoClick(v)
                  }
                >

                  <div className="thumbnail-wrapper">

                    <img
                      src={
                        v.thumbnail ||
                        "https://via.placeholder.com/320x180?text=No+Image"
                      }
                      alt={
                        v.title
                      }
                      className="video-thumbnail"
                      loading="lazy"
                    />


                    {v.duration && (

                      <span className="duration">
                        {v.duration}
                      </span>

                    )}

                  </div>


                  <div className="video-details">

                    <h3 className="video-title">
                      {v.title}
                    </h3>


                    <div className="video-meta">

                      <span className="views">
                        {formatViews(
                          v.views
                        )}
                      </span>

                      {" • "}

                      <span className="time">
                        {timeAgo(
                          v.publishedAt
                        )}
                      </span>

                    </div>


                    <div className="channel-info">

                      <img
                        src={
                          v.channelLogo ||
                          "https://via.placeholder.com/36"
                        }
                        alt={
                          v.channelTitle
                        }
                        className="channel-logo"
                        loading="lazy"
                      />


                      <p className="channel-name">
                        {v.channelTitle}
                      </p>

                    </div>

                  </div>

                </div>

              )
            )

          ) : (

            /* =================================================
               NO VIDEOS
            ================================================= */

            <div className="no-videos-state">

              <div className="no-videos-icon">
                📺
              </div>


              <h3>
                No videos found
              </h3>


              <p>
                We couldn't find what you
                were looking for. Please try
                a different search or category.
              </p>


              <button
                className="no-videos-btn"
                onClick={
                  handleSearchReset
                }
              >
                Go to Home Feed
              </button>

            </div>

          )}


          {/* =================================================
              LOADING MORE
          ================================================= */}

          {isLoadingMore &&
            !showSkeleton &&
            !apiLimitReached && (

              <p
                style={{
                  textAlign: "center",
                  width: "100%",
                  margin: "20px 0",
                }}
              >
                Loading more videos...
              </p>

            )}

        </section>

      </main>

    </>
  );

});


// ============================================================
// DISPLAY NAME
// ============================================================

Home.displayName =
  "Home";


// ============================================================
// EXPORT
// ============================================================

export default Home;