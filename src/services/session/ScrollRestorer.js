// ============================================================
// VPLEX V2 - SCROLL RESTORER
// ============================================================
// Responsible ONLY for reading and restoring scroll position.
//
// It does not store video data.
// It does not control navigation.
// It does not call APIs.
// ============================================================

// ============================================================
// GET CURRENT SCROLL
// ============================================================

function getPosition() {
    if (typeof window === "undefined") {
        return 0;
    }

    return window.scrollY || window.pageYOffset || 0;
}

// ============================================================
// RESTORE SCROLL
// ============================================================

function restore(position, options = {}) {
    if (typeof window === "undefined") {
        return;
    }

    const {
        behavior = "instant",
        delay = 0,
    } = options;

    const restorePosition = () => {
        window.scrollTo({
            top: Number(position) || 0,
            left: 0,
            behavior,
        });
    };

    if (delay > 0) {
        setTimeout(restorePosition, delay);
    } else {
        restorePosition();
    }
}

// ============================================================
// RESTORE AFTER PAGE RENDER
// ============================================================
// Useful because Home may need to render videos before the
// browser can physically scroll to the old position.
// ============================================================

function restoreAfterRender(
    position,
    options = {}
) {
    const {
        attempts = 10,
        interval = 100,
    } = options;

    let count = 0;

    const tryRestore = () => {
        if (typeof window === "undefined") {
            return;
        }

        const documentHeight =
            document.documentElement.scrollHeight;

        const viewportHeight =
            window.innerHeight;

        const maxScroll =
            Math.max(
                0,
                documentHeight - viewportHeight
            );

        const target =
            Math.min(
                Number(position) || 0,
                maxScroll
            );

        window.scrollTo({
            top: target,
            left: 0,
            behavior: "instant",
        });

        count += 1;

        if (
            count < attempts &&
            maxScroll < Number(position)
        ) {
            setTimeout(
                tryRestore,
                interval
            );
        }
    };

    requestAnimationFrame(tryRestore);
}

// ============================================================
// BROWSER SCROLL RESTORATION
// ============================================================

function disableBrowserAutoRestore() {
    if ("scrollRestoration" in history) {
        history.scrollRestoration = "manual";
    }
}

function enableBrowserAutoRestore() {
    if ("scrollRestoration" in history) {
        history.scrollRestoration = "auto";
    }
}

// ============================================================
// EXPORT
// ============================================================

const ScrollRestorer = {
    getPosition,
    restore,
    restoreAfterRender,
    disableBrowserAutoRestore,
    enableBrowserAutoRestore,
};

export default ScrollRestorer;