// v8/js/core/kb.js
// Motor de Memoria Profunda (IndexedDB) para el LMS Semántico

export const KB = {
    dbName: 'TeamTowers_LMS_V8',
    dbVersion: 1,
    db: null,

    init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = (e) => {
                console.error("IndexedDB Error:", e.target.errorCode);
                reject(e.target.errorCode);
            };

            request.onsuccess = (e) => {
                this.db = e.target.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                // Almacén de documentos ontológicos y manuales
                if (!db.objectStoreNames.contains('documents')) {
                    const store = db.createObjectStore('documents', { keyPath: 'id' });
                    store.createIndex('roleTarget', 'roleTarget', { unique: false });
                    store.createIndex('projectId', 'projectId', { unique: false });
                }
            };
        });
    },

    async saveDocument(doc) {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['documents'], 'readwrite');
            const store = transaction.objectStore('documents');
            
            // Estructura JSON-LD inyectada en cada documento
            const semanticDoc = {
                ...doc,
                id: doc.id || 'doc_' + Date.now(),
                lastUpdated: Date.now(),
                jsonLd: {
                    "@context": "https://schema.org",
                    "@type": "TechArticle",
                    "headline": doc.title,
                    "audience": {
                        "@type": "Audience",
                        "audienceType": doc.roleTarget || "All Nodes"
                    },
                    "text": doc.content
                }
            };

            const request = store.put(semanticDoc);
            request.onsuccess = () => resolve(semanticDoc);
            request.onerror = (e) => reject(e.target.error);
        });
    },

    async getAllDocuments(projectId = null) {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['documents'], 'readonly');
            const store = transaction.objectStore('documents');
            const request = store.getAll();

            request.onsuccess = () => {
                let docs = request.result || [];
                if (projectId) docs = docs.filter(d => d.projectId === projectId || d.projectId === 'global');
                resolve(docs);
            };
            request.onerror = (e) => reject(e.target.error);
        });
    }
};
