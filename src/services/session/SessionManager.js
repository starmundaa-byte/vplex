// ============================================================
// VPLEX V2 - SESSION MANAGER
// ============================================================
// THE BRAIN OF THE CLIENT SESSION SYSTEM.
//
// Responsibilities:
//   - Save current feed
//   - Restore current feed
//   - Prefer MemoryStore
//   - Fall back to IndexedDB
//   - Save scroll position
//   - Manage session IDs
//
// It does NOT:
//   - Call YouTube
//   - Call Firestore
//   - Render React components
//   - Control UI
// ============================================================

import MemoryStore from "./MemoryStore";
import IndexedDBStore from "./IndexedDBStore";
import ScrollRestorer from "./ScrollRestorer";


// ============================================================
// VERSION
// ============================================================

const SESSION_VERSION = 1;


// ============================================================
// CURRENT FEED ID
// ============================================================
//
// There is only ONE temporary feed.
//
// Whatever the user is currently viewing becomes
// the current feed.
//
// Examples:
//
// Home
// Search
// Category
//
// All use the same storage slot.
// ============================================================

const CURRENT_FEED_ID = "vplex:current-feed";


// ============================================================
// CREATE SESSION ID
// ============================================================

function createSessionId(type, key = "default") {
    return `${type}:${key}`;
}


// ============================================================
// SAVE SESSION
// ============================================================

async function saveSession(
    sessionId,
    sessionData = {}
) {

    const scrollY =
        sessionData.scrollY ??
        ScrollRestorer.getPosition();

    const session = {

        version: SESSION_VERSION,

        id: sessionId,

        ...sessionData,

        scrollY,

        updatedAt: Date.now(),

    };


    // --------------------------------------------------------
    // MEMORY
    // --------------------------------------------------------

    MemoryStore.set(
        sessionId,
        session
    );


    // --------------------------------------------------------
    // INDEXED DB
    // --------------------------------------------------------

    try {

        await IndexedDBStore.save(
            sessionId,
            session
        );

    } catch (error) {

        console.warn(
            "[Vplex Session] IndexedDB save failed:",
            error
        );

    }


    return session;
}


// ============================================================
// RESTORE SESSION
// ============================================================

async function restoreSession(
    sessionId
) {

    // --------------------------------------------------------
    // 1. MEMORY
    // --------------------------------------------------------

    const memorySession =
        MemoryStore.get(sessionId);

    if (memorySession) {

        return memorySession.data;

    }


    // --------------------------------------------------------
    // 2. INDEXED DB
    // --------------------------------------------------------

    try {

        const databaseSession =
            await IndexedDBStore.get(
                sessionId
            );

        if (databaseSession) {

            const session =
                databaseSession.data;

            MemoryStore.set(
                sessionId,
                session
            );

            return session;

        }

    } catch (error) {

        console.warn(
            "[Vplex Session] IndexedDB restore failed:",
            error
        );

    }


    // --------------------------------------------------------
    // 3. NOTHING
    // --------------------------------------------------------

    return null;
}


// ============================================================
// CURRENT FEED
// ============================================================
//
// These are the methods Home should use.
//
// ============================================================


// ============================================================
// SAVE CURRENT FEED
// ============================================================

async function saveCurrentFeed(
    feedData = {}
) {

    return saveSession(
        CURRENT_FEED_ID,
        {
            pageType: "feed",
            ...feedData,
        }
    );
}


// ============================================================
// RESTORE CURRENT FEED
// ============================================================

async function restoreCurrentFeed() {

    return restoreSession(
        CURRENT_FEED_ID
    );
}


// ============================================================
// UPDATE CURRENT FEED SCROLL
// ============================================================

async function updateCurrentFeedScroll(
    scrollY = ScrollRestorer.getPosition()
) {

    const existing =
        await restoreCurrentFeed();

    if (!existing) {

        return null;

    }


    return saveCurrentFeed({

        ...existing,

        scrollY,

    });
}


// ============================================================
// CLEAR CURRENT FEED
// ============================================================

async function clearCurrentFeed() {

    return removeSession(
        CURRENT_FEED_ID
    );
}


// ============================================================
// SAVE SCROLL FOR ANY SESSION
// ============================================================

async function saveScroll(
    sessionId,
    extraData = {}
) {

    const existing =
        await restoreSession(
            sessionId
        );

    const scrollY =
        ScrollRestorer.getPosition();

    const session = {

        ...(existing || {}),

        ...extraData,

        id: sessionId,

        scrollY,

        version: SESSION_VERSION,

        updatedAt: Date.now(),

    };


    MemoryStore.set(
        sessionId,
        session
    );


    try {

        await IndexedDBStore.save(
            sessionId,
            session
        );

    } catch (error) {

        console.warn(
            "[Vplex Session] Scroll save failed:",
            error
        );

    }


    return session;
}


// ============================================================
// RESTORE SCROLL
// ============================================================

async function restoreScroll(
    sessionId,
    options = {}
) {

    const session =
        await restoreSession(
            sessionId
        );

    if (!session) {

        return false;

    }


    const position =
        Number(session.scrollY) || 0;


    ScrollRestorer.restoreAfterRender(
        position,
        options
    );


    return true;
}


// ============================================================
// RESTORE CURRENT FEED SCROLL
// ============================================================

async function restoreCurrentFeedScroll(
    options = {}
) {

    return restoreScroll(
        CURRENT_FEED_ID,
        options
    );
}


// ============================================================
// REMOVE SESSION
// ============================================================

async function removeSession(
    sessionId
) {

    MemoryStore.remove(
        sessionId
    );


    try {

        await IndexedDBStore.remove(
            sessionId
        );

    } catch (error) {

        console.warn(
            "[Vplex Session] IndexedDB remove failed:",
            error
        );

    }


    return true;
}


// ============================================================
// CLEAR ALL SESSIONS
// ============================================================

async function clearAllSessions() {

    MemoryStore.clear();


    try {

        await IndexedDBStore.clear();

    } catch (error) {

        console.warn(
            "[Vplex Session] IndexedDB clear failed:",
            error
        );

    }


    return true;
}


// ============================================================
// CHECK SESSION
// ============================================================

async function hasSession(
    sessionId
) {

    if (
        MemoryStore.has(
            sessionId
        )
    ) {

        return true;

    }


    try {

        const session =
            await IndexedDBStore.get(
                sessionId
            );

        return Boolean(
            session
        );

    } catch {

        return false;

    }
}


// ============================================================
// CHECK CURRENT FEED
// ============================================================

async function hasCurrentFeed() {

    return hasSession(
        CURRENT_FEED_ID
    );
}


// ============================================================
// EXPORT
// ============================================================

const SessionManager = {

    // General session system
    createSessionId,

    saveSession,
    restoreSession,

    saveScroll,
    restoreScroll,

    removeSession,
    clearAllSessions,

    hasSession,


    // Current feed system
    CURRENT_FEED_ID,

    saveCurrentFeed,
    restoreCurrentFeed,
    updateCurrentFeedScroll,
    restoreCurrentFeedScroll,
    clearCurrentFeed,
    hasCurrentFeed,

};

export default SessionManager;