// store.js - VERSIÓN FINAL CON 71 ROLES
const STORAGE_KEY = 'teamtowers-v3-data';

console.log('📦 Cargando store.js...');

// ============================================
// TODOS LOS ROLES (71 COMPLETOS)
// ============================================
const ALL_ROLES = [
    // === CASTELLER - ADMINISTRACIÓN ===
    { id: '@cap-de-colles', name: 'Cap de Colles', level: 'direcció', multiplier: 2.5, color: '#8b0000' },
    { id: '@president', name: 'President', level: 'administració', multiplier: 2.2, color: '#b22222' },
    { id: '@tresorer', name: 'Tresorer', level: 'administració', multiplier: 1.8, color: '#cd5c5c' },
    { id: '@secretari', name: 'Secretari', level: 'administració', multiplier: 1.5, color: '#a0522d' },
    
    // === CASTELLER - DIRECCIÓN TÉCNICA ===
    { id: '@cap-de-tronc', name: 'Cap de Tronc', level: 'direcció-tècnica', multiplier: 2.1, color: '#b8860b' },
    { id: '@cap-de-pinyes', name: 'Cap de Pinyes', level: 'direcció-tècnica', multiplier: 1.9, color: '#9acd32' },
    { id: '@cap-de-folre', name: 'Cap de Folre', level: 'direcció-tècnica', multiplier: 1.8, color: '#4682b4' },
    
    // === CASTELLER - CIMA ===
    { id: '@enxaneta', name: 'Enxaneta', level: 'cim', multiplier: 2.8, color: '#f59e0b' },
    { id: '@aixecador-1', name: 'Aixecador 1', level: 'cim', multiplier: 2.2, color: '#daa520' },
    { id: '@aixecador-2', name: 'Aixecador 2', level: 'cim', multiplier: 2.1, color: '#b8860b' },
    
    // === CASTELLER - POM DE DALT ===
    { id: '@dosos-esquerra', name: 'Doso Esquerra', level: 'pom-de-dalt', multiplier: 1.9, color: '#9b59b6' },
    { id: '@dosos-dreta', name: 'Doso Dreta', level: 'pom-de-dalt', multiplier: 1.9, color: '#9b59b6' },
    
    // === CASTELLER - TRONC ALT ===
    { id: '@setens-1', name: 'Setens 1', level: 'tronc-alt', multiplier: 1.8, color: '#3498db' },
    { id: '@setens-2', name: 'Setens 2', level: 'tronc-alt', multiplier: 1.8, color: '#3498db' },
    { id: '@setens-3', name: 'Setens 3', level: 'tronc-alt', multiplier: 1.8, color: '#3498db' },
    { id: '@sisens-1', name: 'Sisens 1', level: 'tronc-alt', multiplier: 1.7, color: '#5dade2' },
    { id: '@sisens-2', name: 'Sisens 2', level: 'tronc-alt', multiplier: 1.7, color: '#5dade2' },
    { id: '@quints-1', name: 'Quints 1', level: 'tronc-alt', multiplier: 1.6, color: '#7fb3d5' },
    { id: '@quints-2', name: 'Quints 2', level: 'tronc-alt', multiplier: 1.6, color: '#7fb3d5' },
    { id: '@quints-3', name: 'Quints 3', level: 'tronc-alt', multiplier: 1.6, color: '#7fb3d5' },
    
    // === CASTELLER - TRONC MIG ===
    { id: '@quarts-1', name: 'Quarts 1', level: 'tronc-mig', multiplier: 1.5, color: '#a9cce3' },
    { id: '@quarts-2', name: 'Quarts 2', level: 'tronc-mig', multiplier: 1.5, color: '#a9cce3' },
    { id: '@quarts-3', name: 'Quarts 3', level: 'tronc-mig', multiplier: 1.5, color: '#a9cce3' },
    { id: '@terços-1', name: 'Terços 1', level: 'tronc-mig', multiplier: 1.4, color: '#d4e6f1' },
    { id: '@terços-2', name: 'Terços 2', level: 'tronc-mig', multiplier: 1.4, color: '#d4e6f1' },
    { id: '@terços-3', name: 'Terços 3', level: 'tronc-mig', multiplier: 1.4, color: '#d4e6f1' },
    
    // === CASTELLER - TRONC BAIX ===
    { id: '@segons-1', name: 'Segons 1', level: 'tronc-baix', multiplier: 1.3, color: '#ebf5fb' },
    { id: '@segons-2', name: 'Segons 2', level: 'tronc-baix', multiplier: 1.3, color: '#ebf5fb' },
    { id: '@segons-3', name: 'Segons 3', level: 'tronc-baix', multiplier: 1.3, color: '#ebf5fb' },
    { id: '@baixos-1', name: 'Baixos 1', level: 'tronc-baix', multiplier: 1.2, color: '#f8f9f9' },
    { id: '@baixos-2', name: 'Baixos 2', level: 'tronc-baix', multiplier: 1.2, color: '#f8f9f9' },
    { id: '@baixos-3', name: 'Baixos 3', level: 'tronc-baix', multiplier: 1.2, color: '#f8f9f9' },
    
    // === CASTELLER - MANILLES ===
    { id: '@manilles-1', name: 'Manilles 1', level: 'manilles', multiplier: 1.4, color: '#f4d03f' },
    { id: '@manilles-2', name: 'Manilles 2', level: 'manilles', multiplier: 1.4, color: '#f4d03f' },
    
    // === CASTELLER - FOLRE ===
    { id: '@folre-1', name: 'Folre 1', level: 'folre', multiplier: 1.3, color: '#f7dc6f' },
    { id: '@folre-2', name: 'Folre 2', level: 'folre', multiplier: 1.3, color: '#f7dc6f' },
    
    // === CASTELLER - PINYA ===
    { id: '@agulla-1', name: 'Agulla 1', level: 'pinya', multiplier: 0.9, color: '#f5b041' },
    { id: '@agulla-2', name: 'Agulla 2', level: 'pinya', multiplier: 0.9, color: '#f5b041' },
    { id: '@agulla-3', name: 'Agulla 3', level: 'pinya', multiplier: 0.9, color: '#f5b041' },
    { id: '@contrafort-1', name: 'Contrafort 1', level: 'pinya', multiplier: 0.95, color: '#f39c12' },
    { id: '@contrafort-2', name: 'Contrafort 2', level: 'pinya', multiplier: 0.95, color: '#f39c12' },
    { id: '@contrafort-3', name: 'Contrafort 3', level: 'pinya', multiplier: 0.95, color: '#f39c12' },
    { id: '@crossa-1', name: 'Crossa 1', level: 'pinya', multiplier: 0.9, color: '#e67e22' },
    { id: '@crossa-2', name: 'Crossa 2', level: 'pinya', multiplier: 0.9, color: '#e67e22' },
    { id: '@crossa-3', name: 'Crossa 3', level: 'pinya', multiplier: 0.9, color: '#e67e22' },
    { id: '@crossa-4', name: 'Crossa 4', level: 'pinya', multiplier: 0.9, color: '#e67e22' },
    { id: '@crossa-5', name: 'Crossa 5', level: 'pinya', multiplier: 0.9, color: '#e67e22' },
    { id: '@crossa-6', name: 'Crossa 6', level: 'pinya', multiplier: 0.9, color: '#e67e22' },
    { id: '@vent-1', name: 'Vent 1', level: 'pinya', multiplier: 0.85, color: '#d35400' },
    { id: '@vent-2', name: 'Vent 2', level: 'pinya', multiplier: 0.85, color: '#d35400' },
    { id: '@pinya-general-1', name: 'Pinya General 1', level: 'pinya', multiplier: 0.7, color: '#bdc3c7' },
    { id: '@pinya-general-2', name: 'Pinya General 2', level: 'pinya', multiplier: 0.7, color: '#bdc3c7' },
    
    // === TEAMTOWERS ===
    { id: '@masterproject', name: 'Master Project', level: 'enxaneta', multiplier: 2.5, color: '#f59e0b' },
    { id: '@arquitecto', name: 'Arquitecto', level: 'acotxador', multiplier: 2.0, color: '#8b5cf6' },
    { id: '@Mr-Q', name: 'Mr Q', level: 'terç', multiplier: 1.5, color: '#2563eb' },
    { id: '@tester-guardian', name: 'Tester Guardian', level: 'quart', multiplier: 1.2, color: '#10b981' },
    { id: '@super-z', name: 'Super Z', level: 'quint', multiplier: 1.3, color: '#ec4899' },
    { id: '@economista', name: 'Economista', level: 'segon', multiplier: 1.8, color: '#3b82f6' },
    { id: '@ia-architect', name: 'IA Architect', level: 'acotxador', multiplier: 2.0, color: '#8b5cf6' },
    { id: '@ia-coder', name: 'IA Coder', level: 'terç', multiplier: 1.5, color: '#2563eb' },
    { id: '@ia-tester', name: 'IA Tester', level: 'quart', multiplier: 1.2, color: '#10b981' },
    { id: '@ia-growth', name: 'IA Growth', level: 'quint', multiplier: 1.3, color: '#ec4899' },
    { id: '@ia-economist', name: 'IA Economist', level: 'segon', multiplier: 1.8, color: '#3b82f6' },
    { id: '@ia-ux', name: 'IA UX', level: 'quint', multiplier: 1.2, color: '#f97316' },
    { id: '@ia-comms', name: 'IA Comms', level: 'pinya', multiplier: 1.0, color: '#64748b' },
    { id: '@alvaro-solache', name: 'Álvaro Solache', level: 'enxaneta', multiplier: 2.5, color: '#f59e0b' }
];

// ============================================
// PROYECTOS
// ============================================
const PROJECTS = [
    { id: '#kernel', name: 'Kernel v4.0', sector: 'software' },
    { id: '#paper', name: 'Paper Tokenomics', sector: 'blockchain' },
    { id: '#vna-app', name: 'VNA App', sector: 'software' },
    { id: '#tokenomics', name: 'Tokenomics Engine', sector: 'blockchain' },
    { id: '#gobernanza', name: 'Gobernanza DAO', sector: 'blockchain' },
    { id: '#frontend', name: 'Frontend Core', sector: 'software' },
    { id: '#comunicaciones', name: 'Comunicaciones', sector: 'consultoria' }
];

// ============================================
// USUARIOS
// ============================================
const USERS = [
    { id: '@masterproject', name: 'Master Project', type: 'human' },
    { id: '@alvaro-solache', name: 'Álvaro Solache', type: 'human' },
    { id: '@arquitecto', name: 'Arquitecto IA', type: 'ai' },
    { id: '@Mr-Q', name: 'Mr Q', type: 'ai' },
    { id: '@tester-guardian', name: 'Tester Guardian', type: 'ai' },
    { id: '@super-z', name: 'Super Z', type: 'ai' },
    { id: '@economista', name: 'Economista IA', type: 'ai' },
    { id: '@ia-architect', name: 'IA Architect', type: 'ai' },
    { id: '@ia-coder', name: 'IA Coder', type: 'ai' },
    { id: '@ia-tester', name: 'IA Tester', type: 'ai' },
    { id: '@ia-growth', name: 'IA Growth', type: 'ai' },
    { id: '@ia-economist', name: 'IA Economist', type: 'ai' },
    { id: '@ia-ux', name: 'IA UX', type: 'ai' },
    { id: '@ia-comms', name: 'IA Comms', type: 'ai' }
];

// ============================================
// STORE CON PERSISTENCIA
// ============================================
class Store {
    constructor() {
        console.log('🏗️ Store inicializando...');
        console.log('📊 ALL_ROLES definidos:', ALL_ROLES.length);
        
        this.state = this.loadState();
        this.listeners = [];
        
        console.log('✅ Store listo - Roles en estado:', this.state.roles.length);
    }

    loadState() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                console.log('📂 Datos cargados desde localStorage');
                console.log('   - Roles guardados:', parsed.roles?.length || 0);
                return parsed;
            }
        } catch (e) {
            console.error('❌ Error cargando:', e);
        }
        
        console.log('🌱 Generando datos semilla...');
        return this.generateSeedState();
    }

    saveState() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
        } catch (e) {
            console.error('❌ Error guardando:', e);
        }
    }

    generateSeedState() {
        console.log('🌱 GENERANDO SEMILLA con', ALL_ROLES.length, 'roles');
        const state = {
            projects: [...PROJECTS],
            roles: [...ALL_ROLES], // AQUÍ SE USAN LOS 71 ROLES
            users: [...USERS],
            transactions: this.generateFixedTransactions(100)
        };
        return state;
    }

    generateFixedTransactions(count) {
        const transactions = [];
        const projectIds = PROJECTS.map(p => p.id);
        const roleIds = ALL_ROLES.map(r => r.id);
        const userIds = USERS.map(u => u.id);
        
        for (let i = 1; i <= count; i++) {
            transactions.push({
                id: `tx-${i}`,
                name: `Transacción ${i}`,
                project: projectIds[i % projectIds.length],
                role: roleIds[i % roleIds.length],
                user: userIds[i % userIds.length],
                uv: 100 + (i * 3) % 400,
                type: i % 3 === 0 ? '#intangible' : '#tangible',
                date: new Date(2025, 0, i % 28 + 1).toISOString()
            });
        }
        return transactions;
    }

    getState() {
        return JSON.parse(JSON.stringify(this.state));
    }

    getTransactionsByProject(projectId) {
        return this.state.transactions.filter(t => t.project === projectId);
    }

    getTransactionsByUser(userId) {
        return this.state.transactions.filter(t => t.user === userId);
    }
}

// EXPORTAR GLOBALMENTE
window.store = new Store();
window.ALL_ROLES = ALL_ROLES; // PARA DIAGNÓSTICO
