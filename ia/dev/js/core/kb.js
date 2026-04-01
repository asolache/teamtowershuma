// =============================================================================
// TEAMTOWERS SOS V10 — KB.JS
// Capa de Persistencia IndexedDB Async · Ruta: /ia/dev/js/core/kb.js
// Migrado desde v9 · dbVersion: 17 (V10)
// REGLA: Todo await/async. Nunca sync. Claves kebab-case.
// =============================================================================

export const KB = {
    dbName:    'TeamTowers_V10',
    dbVersion: 17,
    db:        null,

    // ── INIT ──────────────────────────────────────────────────────
    init() {
        return new Promise((resolve, reject) => {
            if (this.db) { resolve(this.db); return; }

            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = (e) => {
                console.error('[KB] Error abriendo IndexedDB:', e.target.error);
                reject(e.target.error);
            };

            request.onsuccess = (e) => {
                this.db = e.target.result;
                console.log(`[KB] IndexedDB "${this.dbName}" v${this.dbVersion} lista.`);
                resolve(this.db);
            };

            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                console.log(`[KB] Upgrade a v${this.dbVersion}...`);

                // Object store principal — misma estructura que v9
                if (!db.objectStoreNames.contains('nodes')) {
                    const store = db.createObjectStore('nodes', { keyPath: 'id' });
                    store.createIndex('type',      'type',      { unique: false });
                    store.createIndex('projectId', 'projectId', { unique: false });
                    store.createIndex('targetId',  'targetId',  { unique: false });
                    store.createIndex('keywords',  'keywords',  { multiEntry: true, unique: false });
                    console.log('[KB] Object store "nodes" creado.');
                }
            };
        });
    },

    // ── CRUD BÁSICO ───────────────────────────────────────────────

    saveNode(node) {
        return new Promise((resolve, reject) => {
            if (!this.db) { reject(new Error('[KB] DB no inicializada.')); return; }
            if (!node?.id) { reject(new Error('[KB] El nodo necesita un id.')); return; }

            const tx      = this.db.transaction('nodes', 'readwrite');
            const store   = tx.objectStore('nodes');
            const request = store.put(node);

            request.onsuccess = () => resolve(node);
            request.onerror   = (e) => reject(e.target.error);
        });
    },

    getNode(id) {
        return new Promise((resolve, reject) => {
            if (!this.db) { resolve(null); return; }

            const tx      = this.db.transaction('nodes', 'readonly');
            const store   = tx.objectStore('nodes');
            const request = store.get(id);

            request.onsuccess = (e) => resolve(e.target.result || null);
            request.onerror   = (e) => reject(e.target.error);
        });
    },

    deleteNode(id) {
        return new Promise((resolve, reject) => {
            if (!this.db) { reject(new Error('[KB] DB no inicializada.')); return; }

            const tx      = this.db.transaction('nodes', 'readwrite');
            const store   = tx.objectStore('nodes');
            const request = store.delete(id);

            request.onsuccess = () => resolve(true);
            request.onerror   = (e) => reject(e.target.error);
        });
    },

    getAllNodes() {
        return new Promise((resolve, reject) => {
            if (!this.db) { resolve([]); return; }

            const tx      = this.db.transaction('nodes', 'readonly');
            const store   = tx.objectStore('nodes');
            const request = store.getAll();

            request.onsuccess = (e) => resolve(e.target.result || []);
            request.onerror   = (e) => reject(e.target.error);
        });
    },

    // ── QUERY POR ÍNDICE ──────────────────────────────────────────

    getNodesByType(type) {
        return new Promise((resolve, reject) => {
            if (!this.db) { resolve([]); return; }

            const tx      = this.db.transaction('nodes', 'readonly');
            const store   = tx.objectStore('nodes');
            const index   = store.index('type');
            const request = index.getAll(type);

            request.onsuccess = (e) => resolve(e.target.result || []);
            request.onerror   = (e) => reject(e.target.error);
        });
    },

    getNodesByProject(projectId) {
        return new Promise((resolve, reject) => {
            if (!this.db) { resolve([]); return; }

            const tx      = this.db.transaction('nodes', 'readonly');
            const store   = tx.objectStore('nodes');
            const index   = store.index('projectId');
            const request = index.getAll(projectId);

            request.onsuccess = (e) => resolve(e.target.result || []);
            request.onerror   = (e) => reject(e.target.error);
        });
    },

    // ── UTILIDADES ────────────────────────────────────────────────

    async purge() {
        const nodes = await this.getAllNodes();
        for (const node of nodes) {
            await this.deleteNode(node.id);
        }
        console.log('[KB] Base de datos purgada.');
        return true;
    },

    async exportAll() {
        const nodes = await this.getAllNodes();
        return {
            version:  'v10',
            exported: new Date().toISOString(),
            count:    nodes.length,
            nodes
        };
    },

    async importAll(data) {
        if (!data?.nodes) throw new Error('[KB] Formato de importación inválido.');
        for (const node of data.nodes) {
            await this.saveNode(node);
        }
        console.log(`[KB] Importados ${data.nodes.length} nodos.`);
        return true;
    }
};
