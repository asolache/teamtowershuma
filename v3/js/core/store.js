// store.js - VERSIÓN CON PERSISTENCIA REAL
const STORE_VERSION = "3.4.0";
const STORAGE_KEY = 'teamtowers-v3-data';

console.log('📦 Cargando store.js...');

// ============================================
// DATOS COMPLETOS (SOLO PARA PRIMERA CARGA)
// ============================================
const SEED_DATA = {
    projects: [
        { id: '#kernel', name: 'Kernel v4.0', sector: 'software' },
        { id: '#paper', name: 'Paper Tokenomics', sector: 'blockchain' },
        { id: '#vna-app', name: 'VNA App', sector: 'software' },
        { id: '#tokenomics', name: 'Tokenomics Engine', sector: 'blockchain' },
        { id: '#gobernanza', name: 'Gobernanza DAO', sector: 'blockchain' }
    ],
    roles: [
        // 71 roles (incluir todos los del histórico)
        { id: '@enxaneta', name: 'Enxaneta', level: 'cim', multiplier: 2.8, color: '#f59e0b' },
        { id: '@acotxador', name: 'Acotxador', level: 'tronc', multiplier: 2.0, color: '#8b5cf6' },
        { id: '@terç', name: 'Terç', level: 'tronc', multiplier: 1.2, color: '#2563eb' },
        { id: '@quart', name: 'Quart', level: 'tronc', multiplier: 1.0, color: '#10b981' },
        { id: '@pinya', name: 'Pinya', level: 'base', multiplier: 0.8, color: '#64748b' },
        { id: '@cap-de-colles', name: 'Cap de Colles', level: 'direcció', multiplier: 2.5, color: '#8b0000' },
        // ... AÑADE TODOS LOS DEMÁS ROLES AQUÍ
    ],
    users: [
        { id: '@masterproject', name: 'Master Project', type: 'human' },
        { id: '@alvaro-solache', name: 'Álvaro Solache', type: 'human' },
        { id: '@arquitecto', name: 'Arquitecto IA', type: 'ai' },
        { id: '@Mr-Q', name: 'Mr Q', type: 'ai' },
        { id: '@tester-guardian', name: 'Tester Guardian', type: 'ai' },
        { id: '@super-z', name: 'Super Z', type: 'ai' },
        { id: '@economista', name: 'Economista IA', type: 'ai' }
    ]
};

// ============================================
// STORE CON PERSISTENCIA
// ============================================
class Store {
    constructor() {
        console.log('🏗️ Store inicializando con persistencia...');
        this.state = this.loadState();
        this.listeners = [];
        
        // Auto-guardar cada 5 segundos (opcional)
        setInterval(() => this.saveState(), 5000);
        
        console.log('✅ Store listo - Roles:', this.state.roles.length);
    }

    // ===== PERSISTENCIA =====
    loadState() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                console.log('📂 Datos cargados desde localStorage');
                return parsed;
            }
        } catch (e) {
            console.error('❌ Error cargando datos:', e);
        }
        
        console.log('🌱 Primera carga - generando datos semilla');
        return this.generateSeedState();
    }

    saveState() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
            console.log('💾 Estado guardado en localStorage');
        } catch (e) {
            console.error('❌ Error guardando estado:', e);
        }
    }

    // ===== ESTADO SEMILLA (CON TRANSACCIONES FIJAS) =====
    generateSeedState() {
        const state = {
            projects: [...SEED_DATA.projects],
            roles: [...SEED_DATA.roles],
            users: [...SEED_DATA.users],
            transactions: this.generateFixedTransactions(50) // 50 transacciones FIJAS
        };
        return state;
    }

    // Genera transacciones FIJAS (no aleatorias cada vez)
    generateFixedTransactions(count) {
        const transactions = [];
        const projects = SEED_DATA.projects.map(p => p.id);
        const roles = SEED_DATA.roles.map(r => r.id);
        const users = SEED_DATA.users.map(u => u.id);
        
        // Usar una semilla para que siempre sean las mismas
        const seed = 42;
        const random = (min, max) => {
            // Generador pseudoaleatorio determinista
            const x = Math.sin(seed * transactions.length) * 10000;
            return Math.floor((x - Math.floor(x)) * (max - min) + min);
        };
        
        for (let i = 1; i <= count; i++) {
            transactions.push({
                id: `tx-${i}`,
                name: `Transacción ${i}`,
                project: projects[i % projects.length],
                role: roles[i % roles.length],
                user: users[i % users.length],
                uv: 100 + (i * 7) % 400, // Valor determinista
                type: i % 3 === 0 ? '#intangible' : '#tangible',
                date: new Date(2025, 0, i % 28 + 1).toISOString()
            });
        }
        return transactions;
    }

    // ===== MÉTODOS PÚBLICOS =====
    getState() {
        return JSON.parse(JSON.stringify(this.state));
    }

    addTransaction(transaction) {
        this.state.transactions.push({
            id: `tx-${Date.now()}`,
            ...transaction,
            date: new Date().toISOString()
        });
        this.saveState();
        this.notify();
        return transaction.id;
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    notify() {
        this.listeners.forEach(l => l(this.getState()));
    }
}

// EXPORTAR GLOBALMENTE
window.store = new Store();
