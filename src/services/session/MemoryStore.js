// ============================================================
// VPLEX V2 - MEMORY STORE
// ============================================================
// Fast temporary session storage.
//
// This lives only while the application is running.
//
// MemoryStore:
//   - Extremely fast
//   - No disk/database access
//   - Lost when the page/application is completely refreshed
//   - Used before IndexedDB
// ============================================================

const memory = new Map();

// ============================================================
// SET
// ============================================================

function set(id, data) {
    memory.set(id, {
        data,
        updatedAt: Date.now(),
    });

    return true;
}

// ============================================================
// GET
// ============================================================

function get(id) {
    const record = memory.get(id);

    if (!record) {
        return null;
    }

    return record;
}

// ============================================================
// HAS
// ============================================================

function has(id) {
    return memory.has(id);
}

// ============================================================
// REMOVE
// ============================================================

function remove(id) {
    return memory.delete(id);
}

// ============================================================
// CLEAR
// ============================================================

function clear() {
    memory.clear();
}

// ============================================================
// GET ALL
// ============================================================

function getAll() {
    return Array.from(memory.entries()).map(
        ([id, record]) => ({
            id,
            ...record,
        })
    );
}

// ============================================================
// EXPORT
// ============================================================

const MemoryStore = {
    set,
    get,
    has,
    remove,
    clear,
    getAll,
};

export default MemoryStore;