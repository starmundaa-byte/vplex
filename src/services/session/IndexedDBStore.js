// ============================================================
// VPLEX V2 - INDEXED DB STORE
// ============================================================
// Purpose:
// Persistent client-side storage for Vplex sessions.
//
// This store:
//   - Does NOT call YouTube
//   - Does NOT call Firestore
//   - Does NOT control navigation
//   - Does NOT manipulate the DOM
//
// SessionManager is responsible for deciding when to use it.
// ============================================================

const DB_NAME = "VplexSessionDB";
const DB_VERSION = 1;

const STORE_NAME = "sessions";

// ============================================================
// OPEN DATABASE
// ============================================================

function openDB() {
    return new Promise((resolve, reject) => {
        if (!("indexedDB" in window)) {
            reject(
                new Error("IndexedDB is not supported by this browser.")
            );
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, {
                    keyPath: "id",
                });
            }
        };

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}

// ============================================================
// SAVE
// ============================================================

async function save(id, data) {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(
            STORE_NAME,
            "readwrite"
        );

        const store = transaction.objectStore(STORE_NAME);

        const record = {
            id,
            data,
            updatedAt: Date.now(),
        };

        const request = store.put(record);

        request.onsuccess = () => {
            resolve(record);
        };

        request.onerror = () => {
            reject(request.error);
        };

        transaction.oncomplete = () => {
            db.close();
        };

        transaction.onerror = () => {
            reject(transaction.error);
        };
    });
}

// ============================================================
// GET
// ============================================================

async function get(id) {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(
            STORE_NAME,
            "readonly"
        );

        const store = transaction.objectStore(STORE_NAME);

        const request = store.get(id);

        request.onsuccess = () => {
            resolve(request.result || null);
        };

        request.onerror = () => {
            reject(request.error);
        };

        transaction.oncomplete = () => {
            db.close();
        };

        transaction.onerror = () => {
            reject(transaction.error);
        };
    });
}

// ============================================================
// DELETE
// ============================================================

async function remove(id) {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(
            STORE_NAME,
            "readwrite"
        );

        const store = transaction.objectStore(STORE_NAME);

        const request = store.delete(id);

        request.onsuccess = () => {
            resolve(true);
        };

        request.onerror = () => {
            reject(request.error);
        };

        transaction.oncomplete = () => {
            db.close();
        };

        transaction.onerror = () => {
            reject(transaction.error);
        };
    });
}

// ============================================================
// CLEAR EVERYTHING
// ============================================================

async function clear() {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(
            STORE_NAME,
            "readwrite"
        );

        const store = transaction.objectStore(STORE_NAME);

        const request = store.clear();

        request.onsuccess = () => {
            resolve(true);
        };

        request.onerror = () => {
            reject(request.error);
        };

        transaction.oncomplete = () => {
            db.close();
        };

        transaction.onerror = () => {
            reject(transaction.error);
        };
    });
}

// ============================================================
// GET ALL
// ============================================================

async function getAll() {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(
            STORE_NAME,
            "readonly"
        );

        const store = transaction.objectStore(STORE_NAME);

        const request = store.getAll();

        request.onsuccess = () => {
            resolve(request.result || []);
        };

        request.onerror = () => {
            reject(request.error);
        };

        transaction.oncomplete = () => {
            db.close();
        };

        transaction.onerror = () => {
            reject(transaction.error);
        };
    });
}

// ============================================================
// EXPORT
// ============================================================

const IndexedDBStore = {
    save,
    get,
    remove,
    clear,
    getAll,
};

export default IndexedDBStore;