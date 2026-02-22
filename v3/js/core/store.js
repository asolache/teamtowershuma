// store.js - Versión con TODOS los roles (Casteller + TeamTowers)
// TeamTowers Humà v3.4 - VERSIÓN COMPLETA

const STORE_VERSION = "3.4.0";

class Store {
    constructor() {
        console.log('🏗️ Store inicializando con TODOS los roles...');
        this.state = this.getInitialState();
        this.listeners = [];
        this.initialized = false;
        
        setTimeout(() => {
            this.loadCompleteData();
            this.initialized = true;
            this.notify();
            console.log('✅ Store listo - Roles cargados:', this.state.roles.length);
        }, 0);
    }

    getInitialState() {
        return {
            version: STORE_VERSION,
            projects: [],
            roles: [],
            users: [],
            transactions: [],
            currentPage: 'dashboard',
            currentUser: null,
            filters: {},
            ui: { loading: false, error: null, notifications: [] }
        };
    }

    getState() { return JSON.parse(JSON.stringify(this.state)); }

    notify() {
        this.listeners.forEach(l => { try { l(this.getState()); } catch (e) {} });
    }

    loadCompleteData() {
        console.log('📊 Cargando TODOS los datos históricos...');
        
        // ============================================
        // 1. PROYECTOS
        // ============================================
        this.state.projects = [
            { id: '#kernel', name: 'Kernel v4.0', sector: 'software', descripcion: 'Núcleo del sistema' },
            { id: '#paper', name: 'Paper Tokenomics', sector: 'blockchain', descripcion: 'Contabilidad de valor' },
            { id: '#vna-app', name: 'VNA App', sector: 'software', descripcion: 'Visualización de redes' },
            { id: '#tokenomics', name: 'Tokenomics Engine', sector: 'blockchain', descripcion: 'Motor económico' },
            { id: '#gobernanza', name: 'Gobernanza DAO', sector: 'blockchain', descripcion: 'Votación y gobierno' },
            { id: '#frontend', name: 'Frontend Core', sector: 'software', descripcion: 'UI/UX' },
            { id: '#comunicaciones', name: 'Comunicaciones', sector: 'consultoria', descripcion: 'Growth y marketing' }
        ];

        // ============================================
        // 2. ROLES COMPLETOS (CASTELLER + TEAMTOWERS)
        // ============================================
        this.state.roles = [
            // === CASTELLER - ADMINISTRACIÓN ===
            { id: '@cap-de-colles', name: 'Cap de Colles', level: 'direcció', multiplier: 2.5, color: '#8b0000', skills: ['liderazgo', 'estratègia', 'visió'] },
            { id: '@president', name: 'President', level: 'administració', multiplier: 2.2, color: '#b22222', skills: ['governança', 'finances', 'legal'] },
            { id: '@tresorer', name: 'Tresorer', level: 'administració', multiplier: 1.8, color: '#cd5c5c', skills: ['finances', 'pressupostos', 'tokenomics'] },
            { id: '@secretari', name: 'Secretari', level: 'administració', multiplier: 1.5, color: '#a0522d', skills: ['documentació', 'arxiu', 'organització'] },
            
            // === CASTELLER - DIRECCIÓN TÉCNICA ===
            { id: '@cap-de-tronc', name: 'Cap de Tronc', level: 'direcció-tècnica', multiplier: 2.1, color: '#b8860b', skills: ['coordinació', 'verticalitat', 'gestió'] },
            { id: '@cap-de-pinyes', name: 'Cap de Pinyes', level: 'direcció-tècnica', multiplier: 1.9, color: '#9acd32', skills: ['gestió de masses', 'seguretat', 'logística'] },
            { id: '@cap-de-folre', name: 'Cap de Folre', level: 'direcció-tècnica', multiplier: 1.8, color: '#4682b4', skills: ['infraestructura', 'reforç', 'estabilitat'] },
            
            // === CASTELLER - CIMA ===
            { id: '@enxaneta', name: 'Enxaneta', level: 'cim', multiplier: 2.8, color: '#ffd700', skills: ['equilibri', 'visió', 'execució'] },
            { id: '@aixecador-1', name: 'Aixecador 1', level: 'cim', multiplier: 2.2, color: '#daa520', skills: ['força', 'estabilitat', 'suport'] },
            { id: '@aixecador-2', name: 'Aixecador 2', level: 'cim', multiplier: 2.1, color: '#b8860b', skills: ['força', 'redundància', 'coordinació'] },
            
            // === CASTELLER - POM DE DALT ===
            { id: '@dosos-esquerra', name: 'Doso Esquerra', level: 'pom-de-dalt', multiplier: 1.9, color: '#9b59b6', skills: ['arquitectura', 'disseny', 'precisió'] },
            { id: '@dosos-dreta', name: 'Doso Dreta', level: 'pom-de-dalt', multiplier: 1.9, color: '#9b59b6', skills: ['arquitectura', 'disseny', 'precisió'] },
            
            // === CASTELLER - TRONC ALT ===
            { id: '@setens-1', name: 'Setens 1', level: 'tronc-alt', multiplier: 1.8, color: '#3498db', skills: ['desenvolupament avançat', 'precisió'] },
            { id: '@setens-2', name: 'Setens 2', level: 'tronc-alt', multiplier: 1.8, color: '#3498db', skills: ['desenvolupament avançat', 'precisió'] },
            { id: '@setens-3', name: 'Setens 3', level: 'tronc-alt', multiplier: 1.8, color: '#3498db', skills: ['desenvolupament avançat', 'precisió'] },
            { id: '@sisens-1', name: 'Sisens 1', level: 'tronc-alt', multiplier: 1.7, color: '#5dade2', skills: ['desenvolupament', 'mentoria'] },
            { id: '@sisens-2', name: 'Sisens 2', level: 'tronc-alt', multiplier: 1.7, color: '#5dade2', skills: ['desenvolupament', 'mentoria'] },
            { id: '@quints-1', name: 'Quints 1', level: 'tronc-alt', multiplier: 1.6, color: '#7fb3d5', skills: ['fullstack', 'resolució'] },
            { id: '@quints-2', name: 'Quints 2', level: 'tronc-alt', multiplier: 1.6, color: '#7fb3d5', skills: ['fullstack', 'resolució'] },
            { id: '@quints-3', name: 'Quints 3', level: 'tronc-alt', multiplier: 1.6, color: '#7fb3d5', skills: ['fullstack', 'resolució'] },
            
            // === CASTELLER - TRONC MIG ===
            { id: '@quarts-1', name: 'Quarts 1', level: 'tronc-mig', multiplier: 1.5, color: '#a9cce3', skills: ['fullstack', 'implementació'] },
            { id: '@quarts-2', name: 'Quarts 2', level: 'tronc-mig', multiplier: 1.5, color: '#a9cce3', skills: ['fullstack', 'implementació'] },
            { id: '@quarts-3', name: 'Quarts 3', level: 'tronc-mig', multiplier: 1.5, color: '#a9cce3', skills: ['fullstack', 'implementació'] },
            { id: '@terços-1', name: 'Terços 1', level: 'tronc-mig', multiplier: 1.4, color: '#d4e6f1', skills: ['desenvolupament', 'backend'] },
            { id: '@terços-2', name: 'Terços 2', level: 'tronc-mig', multiplier: 1.4, color: '#d4e6f1', skills: ['desenvolupament', 'backend'] },
            { id: '@terços-3', name: 'Terços 3', level: 'tronc-mig', multiplier: 1.4, color: '#d4e6f1', skills: ['desenvolupament', 'backend'] },
            
            // === CASTELLER - TRONC BAIX ===
            { id: '@segons-1', name: 'Segons 1', level: 'tronc-baix', multiplier: 1.3, color: '#ebf5fb', skills: ['core', 'backend', 'base de dades'] },
            { id: '@segons-2', name: 'Segons 2', level: 'tronc-baix', multiplier: 1.3, color: '#ebf5fb', skills: ['core', 'backend'] },
            { id: '@segons-3', name: 'Segons 3', level: 'tronc-baix', multiplier: 1.3, color: '#ebf5fb', skills: ['core', 'backend'] },
            { id: '@baixos-1', name: 'Baixos 1', level: 'tronc-baix', multiplier: 1.2, color: '#f8f9f9', skills: ['fonaments', 'estabilitat'] },
            { id: '@baixos-2', name: 'Baixos 2', level: 'tronc-baix', multiplier: 1.2, color: '#f8f9f9', skills: ['fonaments', 'estabilitat'] },
            { id: '@baixos-3', name: 'Baixos 3', level: 'tronc-baix', multiplier: 1.2, color: '#f8f9f9', skills: ['fonaments', 'estabilitat'] },
            
            // === CASTELLER - MANILLES ===
            { id: '@manilles-1', name: 'Manilles 1', level: 'manilles', multiplier: 1.4, color: '#f4d03f', skills: ['infraestructura', 'devops'] },
            { id: '@manilles-2', name: 'Manilles 2', level: 'manilles', multiplier: 1.4, color: '#f4d03f', skills: ['infraestructura', 'devops'] },
            
            // === CASTELLER - FOLRE ===
            { id: '@folre-1', name: 'Folre 1', level: 'folre', multiplier: 1.3, color: '#f7dc6f', skills: ['middleware', 'framework'] },
            { id: '@folre-2', name: 'Folre 2', level: 'folre', multiplier: 1.3, color: '#f7dc6f', skills: ['middleware', 'framework'] },
            
            // === CASTELLER - PINYA ===
            { id: '@agulla-1', name: 'Agulla 1', level: 'pinya', multiplier: 0.9, color: '#f5b041', skills: ['seguretat', 'auditoria'] },
            { id: '@agulla-2', name: 'Agulla 2', level: 'pinya', multiplier: 0.9, color: '#f5b041', skills: ['seguretat', 'auditoria'] },
            { id: '@agulla-3', name: 'Agulla 3', level: 'pinya', multiplier: 0.9, color: '#f5b041', skills: ['seguretat', 'auditoria'] },
            { id: '@contrafort-1', name: 'Contrafort 1', level: 'pinya', multiplier: 0.95, color: '#f39c12', skills: ['estabilitat', 'reforç'] },
            { id: '@contrafort-2', name: 'Contrafort 2', level: 'pinya', multiplier: 0.95, color: '#f39c12', skills: ['estabilitat', 'reforç'] },
            { id: '@contrafort-3', name: 'Contrafort 3', level: 'pinya', multiplier: 0.95, color: '#f39c12', skills: ['estabilitat', 'reforç'] },
            { id: '@crossa-1', name: 'Crossa 1', level: 'pinya', multiplier: 0.9, color: '#e67e22', skills: ['sre', 'equilibri'] },
            { id: '@crossa-2', name: 'Crossa 2', level: 'pinya', multiplier: 0.9, color: '#e67e22', skills: ['sre', 'equilibri'] },
            { id: '@crossa-3', name: 'Crossa 3', level: 'pinya', multiplier: 0.9, color: '#e67e22', skills: ['sre', 'equilibri'] },
            { id: '@crossa-4', name: 'Crossa 4', level: 'pinya', multiplier: 0.9, color: '#e67e22', skills: ['sre', 'equilibri'] },
            { id: '@crossa-5', name: 'Crossa 5', level: 'pinya', multiplier: 0.9, color: '#e67e22', skills: ['sre', 'equilibri'] },
            { id: '@crossa-6', name: 'Crossa 6', level: 'pinya', multiplier: 0.9, color: '#e67e22', skills: ['sre', 'equilibri'] },
            { id: '@vent-1', name: 'Vent 1', level: 'pinya', multiplier: 0.85, color: '#d35400', skills: ['equilibri dinàmic'] },
            { id: '@vent-2', name: 'Vent 2', level: 'pinya', multiplier: 0.85, color: '#d35400', skills: ['equilibri dinàmic'] },
            { id: '@pinya-general-1', name: 'Pinya General 1', level: 'pinya', multiplier: 0.7, color: '#bdc3c7', skills: ['massa', 'cohesió'] },
            { id: '@pinya-general-2', name: 'Pinya General 2', level: 'pinya', multiplier: 0.7, color: '#bdc3c7', skills: ['massa', 'cohesió'] },
            
            // === TEAMTOWERS - ROLES ORIGINALES ===
            { id: '@masterproject', name: 'Master Project', level: 'enxaneta', multiplier: 2.5, color: '#f59e0b', skills: ['visión', 'liderazgo', 'estrategia'] },
            { id: '@arquitecto', name: 'Arquitecto', level: 'acotxador', multiplier: 2.0, color: '#8b5cf6', skills: ['arquitectura', 'diseño'] },
            { id: '@Mr-Q', name: 'Mr Q', level: 'terç', multiplier: 1.5, color: '#2563eb', skills: ['desarrollo', 'javascript'] },
            { id: '@tester-guardian', name: 'Tester Guardian', level: 'quart', multiplier: 1.2, color: '#10b981', skills: ['testing', 'qa'] },
            { id: '@super-z', name: 'Super Z', level: 'quint', multiplier: 1.3, color: '#ec4899', skills: ['growth', 'marketing'] },
            { id: '@economista', name: 'Economista', level: 'segon', multiplier: 1.8, color: '#3b82f6', skills: ['tokenomics', 'economía'] },
            { id: '@ia-architect', name: 'IA Architect', level: 'acotxador', multiplier: 2.0, color: '#8b5cf6', skills: ['arquitectura-ia'] },
            { id: '@ia-coder', name: 'IA Coder', level: 'terç', multiplier: 1.5, color: '#2563eb', skills: ['python', 'solidity'] },
            { id: '@ia-tester', name: 'IA Tester', level: 'quart', multiplier: 1.2, color: '#10b981', skills: ['testing-automated'] },
            { id: '@ia-growth', name: 'IA Growth', level: 'quint', multiplier: 1.3, color: '#ec4899', skills: ['analytics'] },
            { id: '@ia-economist', name: 'IA Economist', level: 'segon', multiplier: 1.8, color: '#3b82f6', skills: ['modelos-económicos'] },
            { id: '@ia-ux', name: 'IA UX', level: 'quint', multiplier: 1.2, color: '#f97316', skills: ['ui', 'ux'] },
            { id: '@ia-comms', name: 'IA Comms', level: 'pinya', multiplier: 1.0, color: '#64748b', skills: ['comunicación'] },
            { id: '@alvaro-solache', name: 'Álvaro Solache', level: 'enxaneta', multiplier: 2.5, color: '#f59e0b', skills: ['dirección'] },
            
            // === EQUIP D'ACOLLIDA ===
            { id: '@acollida-1', name: 'Equip Acollida 1', level: 'soporte', multiplier: 1.1, color: '#1abc9c', skills: ['onboarding', 'formació'] },
            { id: '@acollida-2', name: 'Equip Acollida 2', level: 'soporte', multiplier: 1.1, color: '#1abc9c', skills: ['onboarding', 'formació'] }
        ];

        // ============================================
        // 3. USUARIOS
        // ============================================
        this.state.users = [
            { id: '@masterproject', name: 'Master Project', type: 'human' },
            { id: '@alvaro-solache', name: 'Álvaro Solache', type: 'human' },
            { id: '@arquitecto', name: 'Arquitecto IA', type: 'ai', provider: 'Claude' },
            { id: '@Mr-Q', name: 'Mr Q', type: 'ai', provider: 'Claude' },
            { id: '@tester-guardian', name: 'Tester Guardian', type: 'ai', provider: 'Claude' },
            { id: '@super-z', name: 'Super Z', type: 'ai', provider: 'Claude' },
            { id: '@economista', name: 'Economista IA', type: 'ai', provider: 'Claude' },
            { id: '@ia-architect', name: 'IA Architect', type: 'ai', provider: 'Anthropic' },
            { id: '@ia-coder', name: 'IA Coder', type: 'ai', provider: 'OpenAI' },
            { id: '@ia-tester', name: 'IA Tester', type: 'ai', provider: 'OpenAI' },
            { id: '@ia-growth', name: 'IA Growth', type: 'ai', provider: 'OpenAI' },
            { id: '@ia-economist', name: 'IA Economist', type: 'ai', provider: 'Anthropic' },
            { id: '@ia-ux', name: 'IA UX', type: 'ai', provider: 'OpenAI' },
            { id: '@ia-comms', name: 'IA Comms', type: 'ai', provider: 'OpenAI' }
        ];

        // ============================================
        // 4. TRANSACCIONES DE EJEMPLO (50+)
        // ============================================
        const tx = [];
        const projects = this.state.projects.map(p => p.id);
        const roles = this.state.roles.map(r => r.id);
        
        // Generar 100 transacciones aleatorias para que se vea el mapa
        for (let i = 1; i <= 100; i++) {
            const project = projects[Math.floor(Math.random() * projects.length)];
            const role = roles[Math.floor(Math.random() * roles.length)];
            const user = this.state.users[Math.floor(Math.random() * this.state.users.length)].id;
            const type = Math.random() > 0.3 ? '#tangible' : '#intangible';
            const uv = Math.floor(Math.random() * 500) + 100;
            
            tx.push({
                id: `tx-${i}`,
                name: `Transacción ${i}`,
                project: project,
                role: role,
                user: user,
                uv: uv,
                type: type,
                date: new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString()
            });
        }
        
        this.state.transactions = tx;

        console.log('✅ Datos completos cargados:', {
            proyectos: this.state.projects.length,
            roles: this.state.roles.length,
            usuarios: this.state.users.length,
            transacciones: this.state.transactions.length
        });
    }
}

export const store = new Store();
window.store = store;
