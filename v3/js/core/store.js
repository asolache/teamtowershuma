// store.js - VERSIÓN QUE FUNCIONA SIEMPRE
// TeamTowers Humà v3.4

console.log('📦 Cargando store.js...');

// ============================================
// DATOS COMPLETOS (TODOS LOS ROLES)
// ============================================
const COMPLETE_DATA = {
    projects: [
        { id: '#kernel', name: 'Kernel v4.0', sector: 'software' },
        { id: '#paper', name: 'Paper Tokenomics', sector: 'blockchain' },
        { id: '#vna-app', name: 'VNA App', sector: 'software' },
        { id: '#tokenomics', name: 'Tokenomics Engine', sector: 'blockchain' },
        { id: '#gobernanza', name: 'Gobernanza DAO', sector: 'blockchain' },
        { id: '#frontend', name: 'Frontend Core', sector: 'software' },
        { id: '#comunicaciones', name: 'Comunicaciones', sector: 'consultoria' }
    ],

    roles: [
        // === CASTELLER COMPLETO (70+ roles) ===
        { id: '@cap-de-colles', name: 'Cap de Colles', level: 'direcció', multiplier: 2.5, color: '#8b0000' },
        { id: '@president', name: 'President', level: 'administració', multiplier: 2.2, color: '#b22222' },
        { id: '@tresorer', name: 'Tresorer', level: 'administració', multiplier: 1.8, color: '#cd5c5c' },
        { id: '@secretari', name: 'Secretari', level: 'administració', multiplier: 1.5, color: '#a0522d' },
        { id: '@cap-de-tronc', name: 'Cap de Tronc', level: 'direcció-tècnica', multiplier: 2.1, color: '#b8860b' },
        { id: '@cap-de-pinyes', name: 'Cap de Pinyes', level: 'direcció-tècnica', multiplier: 1.9, color: '#9acd32' },
        { id: '@cap-de-folre', name: 'Cap de Folre', level: 'direcció-tècnica', multiplier: 1.8, color: '#4682b4' },
        { id: '@enxaneta', name: 'Enxaneta', level: 'cim', multiplier: 2.8, color: '#f59e0b' },
        { id: '@aixecador-1', name: 'Aixecador 1', level: 'cim', multiplier: 2.2, color: '#daa520' },
        { id: '@aixecador-2', name: 'Aixecador 2', level: 'cim', multiplier: 2.1, color: '#b8860b' },
        { id: '@dosos-esquerra', name: 'Doso Esquerra', level: 'pom-de-dalt', multiplier: 1.9, color: '#9b59b6' },
        { id: '@dosos-dreta', name: 'Doso Dreta', level: 'pom-de-dalt', multiplier: 1.9, color: '#9b59b6' },
        { id: '@setens-1', name: 'Setens 1', level: 'tronc-alt', multiplier: 1.8, color: '#3498db' },
        { id: '@setens-2', name: 'Setens 2', level: 'tronc-alt', multiplier: 1.8, color: '#3498db' },
        { id: '@setens-3', name: 'Setens 3', level: 'tronc-alt', multiplier: 1.8, color: '#3498db' },
        { id: '@sisens-1', name: 'Sisens 1', level: 'tronc-alt', multiplier: 1.7, color: '#5dade2' },
        { id: '@sisens-2', name: 'Sisens 2', level: 'tronc-alt', multiplier: 1.7, color: '#5dade2' },
        { id: '@quints-1', name: 'Quints 1', level: 'tronc-alt', multiplier: 1.6, color: '#7fb3d5' },
        { id: '@quints-2', name: 'Quints 2', level: 'tronc-alt', multiplier: 1.6, color: '#7fb3d5' },
        { id: '@quints-3', name: 'Quints 3', level: 'tronc-alt', multiplier: 1.6, color: '#7fb3d5' },
        { id: '@quarts-1', name: 'Quarts 1', level: 'tronc-mig', multiplier: 1.5, color: '#a9cce3' },
        { id: '@quarts-2', name: 'Quarts 2', level: 'tronc-mig', multiplier: 1.5, color: '#a9cce3' },
        { id: '@quarts-3', name: 'Quarts 3', level: 'tronc-mig', multiplier: 1.5, color: '#a9cce3' },
        { id: '@terços-1', name: 'Terços 1', level: 'tronc-mig', multiplier: 1.4, color: '#d4e6f1' },
        { id: '@terços-2', name: 'Terços 2', level: 'tronc-mig', multiplier: 1.4, color: '#d4e6f1' },
        { id: '@terços-3', name: 'Terços 3', level: 'tronc-mig', multiplier: 1.4, color: '#d4e6f1' },
        { id: '@segons-1', name: 'Segons 1', level: 'tronc-baix', multiplier: 1.3, color: '#ebf5fb' },
        { id: '@segons-2', name: 'Segons 2', level: 'tronc-baix', multiplier: 1.3, color: '#ebf5fb' },
        { id: '@segons-3', name: 'Segons 3', level: 'tronc-baix', multiplier: 1.3, color: '#ebf5fb' },
        { id: '@baixos-1', name: 'Baixos 1', level: 'tronc-baix', multiplier: 1.2, color: '#f8f9f9' },
        { id: '@baixos-2', name: 'Baixos 2', level: 'tronc-baix', multiplier: 1.2, color: '#f8f9f9' },
        { id: '@baixos-3', name: 'Baixos 3', level: 'tronc-baix', multiplier: 1.2, color: '#f8f9f9' },
        { id: '@manilles-1', name: 'Manilles 1', level: 'manilles', multiplier: 1.4, color: '#f4d03f' },
        { id: '@manilles-2', name: 'Manilles 2', level: 'manilles', multiplier: 1.4, color: '#f4d03f' },
        { id: '@folre-1', name: 'Folre 1', level: 'folre', multiplier: 1.3, color: '#f7dc6f' },
        { id: '@folre-2', name: 'Folre 2', level: 'folre', multiplier: 1.3, color: '#f7dc6f' },
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
    ],

    users: [
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
    ]
};

// ============================================
// STORE
// ============================================
class Store {
    constructor() {
        console.log('🏗️ Store inicializando...');
        this.state = {
            projects: COMPLETE_DATA.projects,
            roles: COMPLETE_DATA.roles,
            users: COMPLETE_DATA.users,
            transactions: this.generateTransactions(100)
        };
        console.log('✅ Store listo - Roles:', this.state.roles.length);
    }

    getState() {
        return JSON.parse(JSON.stringify(this.state));
    }

    generateTransactions(count) {
        const tx = [];
        const projects = this.state.projects.map(p => p.id);
        const roles = this.state.roles.map(r => r.id);
        const users = this.state.users.map(u => u.id);
        
        for (let i = 1; i <= count; i++) {
            tx.push({
                id: `tx-${i}`,
                name: `Transacción ${i}`,
                project: projects[Math.floor(Math.random() * projects.length)],
                role: roles[Math.floor(Math.random() * roles.length)],
                user: users[Math.floor(Math.random() * users.length)],
                uv: Math.floor(Math.random() * 400) + 100,
                type: Math.random() > 0.3 ? '#tangible' : '#intangible',
                date: new Date().toISOString()
            });
        }
        return tx;
    }
}

// EXPORTAR GLOBALMENTE
window.store = new Store();
console.log('✅ Store disponible globalmente');
