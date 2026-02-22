// store.js - Estado central con reducer pattern y versionado
// System Prompt: Store inmutable con acciones controladas y persistencia versionada
// Última modificación: 22/02/2026
// Versión: 3.3.0
// Responsable: @arquitecto

const STORE_VERSION = "3.3.0";

class Store {
    constructor() {
        console.log('🏗️ Store inicializando...');
        this.state = this.getInitialState();
        this.listeners = [];
        this.initialized = false;
        this.migrations = {
            "2.0.0": (oldState) => this.migrateFromV2(oldState),
            "3.0.0": (oldState) => this.migrateFromV3(oldState),
            "3.1.0": (oldState) => this.migrateFromV31(oldState),
            "3.2.0": (oldState) => this.migrateFromV32(oldState)
        };
        
        // Inicializar después de crear la instancia
        setTimeout(() => {
            this.hydrate();
            this.initialized = true;
            this.notify();
            console.log('✅ Store listo', {
                proyectos: this.state.projects.length,
                roles: this.state.roles.length,
                usuarios: this.state.users.length,
                transacciones: this.state.transactions.length
            });
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
            ui: {
                loading: false,
                error: null,
                notifications: []
            }
        };
    }

    // ===== MÉTODOS PÚBLICOS =====
    
    // Obtener estado (solo lectura - clonado)
    getState() {
        return JSON.parse(JSON.stringify(this.state));
    }

    // Despachar acciones (única forma de modificar el estado)
    dispatch(action) {
        if (!action || !action.type) {
            console.error('❌ Acción inválida:', action);
            return false;
        }

        const oldState = this.state;
        const newState = this.reducer(oldState, action);
        
        if (newState !== oldState) {
            this.state = newState;
            this.persist();
            this.notify();
            console.log('📦 Acción despachada:', action.type, action.payload);
            return true;
        }
        return false;
    }

    // Suscribirse a cambios
    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    // ===== REDUCER =====
    reducer(state, action) {
        switch(action.type) {
            case 'SET_PROJECTS':
                return { ...state, projects: action.payload };
            case 'ADD_PROJECT':
                return { 
                    ...state, 
                    projects: [...state.projects, { 
                        id: `#${action.payload.name.toLowerCase().replace(/\s+/g, '-')}`,
                        ...action.payload,
                        createdAt: new Date().toISOString()
                    }] 
                };
            case 'UPDATE_PROJECT':
                return {
                    ...state,
                    projects: state.projects.map(p => 
                        p.id === action.payload.id ? { ...p, ...action.payload.updates } : p
                    )
                };
            case 'SET_ROLES':
                return { ...state, roles: action.payload };
            case 'ADD_ROLE':
                return { 
                    ...state, 
                    roles: [...state.roles, { 
                        id: action.payload.id || `@${action.payload.name.toLowerCase()}`,
                        ...action.payload,
                        createdAt: new Date().toISOString()
                    }] 
                };
            case 'SET_USERS':
                return { ...state, users: action.payload };
            case 'ADD_USER':
                return { 
                    ...state, 
                    users: [...state.users, { 
                        id: action.payload.id || `@${action.payload.name.toLowerCase()}`,
                        ...action.payload,
                        createdAt: new Date().toISOString()
                    }] 
                };
            case 'UPDATE_USER':
                return {
                    ...state,
                    users: state.users.map(u => 
                        u.id === action.payload.id ? { ...u, ...action.payload.updates } : u
                    )
                };
            case 'SET_TRANSACTIONS':
                return { ...state, transactions: action.payload };
            case 'ADD_TRANSACTION':
                return { 
                    ...state, 
                    transactions: [...state.transactions, { 
                        id: action.payload.id || `tx-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
                        ...action.payload,
                        date: action.payload.date || new Date().toISOString()
                    }] 
                };
            case 'UPDATE_TRANSACTION':
                return {
                    ...state,
                    transactions: state.transactions.map(t => 
                        t.id === action.payload.id ? { ...t, ...action.payload.updates } : t
                    )
                };
            case 'DELETE_TRANSACTION':
                return {
                    ...state,
                    transactions: state.transactions.filter(t => t.id !== action.payload.id)
                };
            case 'SET_CURRENT_PAGE':
                return { ...state, currentPage: action.payload };
            case 'SET_CURRENT_USER':
                return { ...state, currentUser: action.payload };
            case 'SET_FILTERS':
                return { ...state, filters: { ...state.filters, ...action.payload } };
            case 'SET_LOADING':
                return { ...state, ui: { ...state.ui, loading: action.payload } };
            case 'SET_ERROR':
                return { ...state, ui: { ...state.ui, error: action.payload } };
            case 'ADD_NOTIFICATION':
                return { 
                    ...state, 
                    ui: { 
                        ...state.ui, 
                        notifications: [...state.ui.notifications, {
                            id: Date.now(),
                            ...action.payload,
                            read: false
                        }] 
                    } 
                };
            case 'MARK_NOTIFICATION_READ':
                return {
                    ...state,
                    ui: {
                        ...state.ui,
                        notifications: state.ui.notifications.map(n =>
                            n.id === action.payload ? { ...n, read: true } : n
                        )
                    }
                };
            case 'CLEAR_NOTIFICATIONS':
                return { ...state, ui: { ...state.ui, notifications: [] } };
            case 'RESET_STORE':
                return this.getInitialState();
            default:
                return state;
        }
    }

    // ===== PERSISTENCIA =====
    persist() {
        try {
            const toSave = {
                version: this.state.version,
                projects: this.state.projects,
                roles: this.state.roles,
                users: this.state.users,
                transactions: this.state.transactions
            };
            localStorage.setItem('teamtowers-v3', JSON.stringify(toSave));
            console.log('💾 Datos persistidos');
        } catch (e) {
            console.error('❌ Error persistiendo datos:', e);
        }
    }

    hydrate() {
        try {
            const saved = localStorage.getItem('teamtowers-v3');
            if (!saved) {
                console.log('📂 No hay datos guardados, cargando histórico...');
                this.loadHistoricalData();
                return;
            }

            const parsed = JSON.parse(saved);
            
            if (parsed.version && parsed.version !== STORE_VERSION) {
                console.log(`🔄 Migrando de versión ${parsed.version} a ${STORE_VERSION}`);
                const migrator = this.migrations[parsed.version];
                if (migrator) {
                    const migrated = migrator(parsed);
                    this.state = { ...this.state, ...migrated };
                    console.log('✅ Migración completada');
                } else {
                    console.warn(`⚠️ Versión ${parsed.version} no migrable, usando histórico`);
                    this.loadHistoricalData();
                }
            } else {
                this.state = {
                    ...this.state,
                    projects: parsed.projects || [],
                    roles: parsed.roles || [],
                    users: parsed.users || [],
                    transactions: parsed.transactions || []
                };
                console.log('📂 Datos cargados desde localStorage');
            }
        } catch (e) {
            console.error('❌ Error cargando datos:', e);
            this.loadHistoricalData();
        }
    }

    // ===== DATOS HISTÓRICOS DE TEAMTOWERS =====
    loadHistoricalData() {
        console.log('📊 Cargando datos históricos de TeamTowers...');
        
        // PROYECTOS
        this.state.projects = [
            { id: '#kernel', name: 'Kernel v4', sector: 'software', description: 'Núcleo del sistema de tokenomics', createdAt: '2025-06-15T10:00:00Z' },
            { id: '#paper', name: 'Paper Tokenomics', sector: 'blockchain', description: 'Sistema de contabilidad de valor', createdAt: '2025-07-20T10:00:00Z' },
            { id: '#vna-app', name: 'VNA App', sector: 'software', description: 'Aplicación de Value Network Analysis', createdAt: '2025-09-01T10:00:00Z' },
            { id: '#tokenomics', name: 'Tokenomics Engine', sector: 'blockchain', description: 'Motor de economía tokenizada', createdAt: '2025-10-10T10:00:00Z' },
            { id: '#gobernanza', name: 'Gobernanza DAO', sector: 'blockchain', description: 'Sistema de votación y gobierno', createdAt: '2025-11-05T10:00:00Z' },
            { id: '#frontend', name: 'Frontend Core', sector: 'software', description: 'Aplicación de usuario', createdAt: '2025-12-01T10:00:00Z' }
        ];

        // ROLES (MODELO CASTELLER COMPLETO)
        this.state.roles = [
            { id: '@enxaneta', name: 'Enxaneta', level: 'cim', description: 'Visión y logro final', multiplier: 2.5, color: '#f59e0b', skills: ['visión', 'liderazgo', 'equilibrio'] },
            { id: '@acotxador', name: 'Acotxador', level: 'tronc', description: 'Arquitectura y soporte', multiplier: 2.0, color: '#8b5cf6', skills: ['arquitectura', 'diseño', 'estabilidad'] },
            { id: '@segon', name: 'Segon', level: 'tronc', description: 'Implementación avanzada', multiplier: 1.5, color: '#3b82f6', skills: ['backend', 'api', 'bases de datos'] },
            { id: '@terç', name: 'Terç', level: 'tronc', description: 'Desarrollo principal', multiplier: 1.2, color: '#2563eb', skills: ['desarrollo', 'implementación', 'tests'] },
            { id: '@quart', name: 'Quart', level: 'tronc', description: 'Desarrollo junior', multiplier: 1.0, color: '#10b981', skills: ['frontend', 'componentes', 'colaboración'] },
            { id: '@pinya', name: 'Pinya', level: 'base', description: 'Soporte e infraestructura', multiplier: 0.8, color: '#64748b', skills: ['soporte', 'devops', 'mantenimiento'] },
            { id: '@cap-de-colles', name: 'Cap de Colles', level: 'dirección', description: 'Liderazgo estratégico', multiplier: 2.2, color: '#8b0000', skills: ['liderazgo', 'estrategia', 'gestión'] },
            { id: '@aixecador', name: 'Aixecador', level: 'cim', description: 'Soporte al enxaneta', multiplier: 2.1, color: '#daa520', skills: ['estabilidad', 'soporte', 'coordinación'] },
            { id: '@dosos', name: 'Dosos', level: 'pom-de-dalt', description: 'Arquitectura de solución', multiplier: 1.9, color: '#9b59b6', skills: ['arquitectura', 'diseño', 'precisión'] },
            { id: '@setens', name: 'Setens', level: 'tronc-alt', description: 'Desarrollo senior', multiplier: 1.8, color: '#3498db', skills: ['desarrollo avanzado', 'mentoría', 'revisión'] },
            { id: '@quints', name: 'Quints', level: 'tronc-alt', description: 'Fullstack senior', multiplier: 1.6, color: '#7fb3d5', skills: ['fullstack', 'resolución', 'optimización'] },
            { id: '@manilles', name: 'Manilles', level: 'manilles', description: 'Infraestructura y devops', multiplier: 1.4, color: '#f4d03f', skills: ['devops', 'infraestructura', 'ci/cd'] },
            { id: '@folre', name: 'Folre', level: 'folre', description: 'Middleware y servicios', multiplier: 1.3, color: '#f7dc6f', skills: ['middleware', 'api', 'servicios'] },
            { id: '@agulla', name: 'Agulla', level: 'pinya', description: 'Seguridad y auditoría', multiplier: 0.9, color: '#f5b041', skills: ['seguridad', 'auditoría', 'monitoreo'] },
            { id: '@crossa', name: 'Crossa', level: 'pinya', description: 'Soporte lateral y SRE', multiplier: 0.9, color: '#e67e22', skills: ['sre', 'soporte', 'resiliencia'] }
        ];

        // USUARIOS
        this.state.users = [
            { id: '@masterproject', name: 'Master Project', type: 'human', skills: { "visión": 0.95, "liderazgo": 0.9, "estrategia": 0.85, "comunicación": 0.8 } },
            { id: '@arquitecto', name: 'Arquitecto', type: 'human', skills: { "arquitectura": 0.95, "diseño": 0.9, "backend": 0.8, "documentación": 0.75 } },
            { id: '@Mr-Q', name: 'Mr Q', type: 'human', skills: { "desarrollo": 0.95, "javascript": 0.9, "react": 0.85, "node": 0.8, "bases de datos": 0.75 } },
            { id: '@tester-guardian', name: 'Tester Guardian', type: 'human', skills: { "testing": 0.95, "qa": 0.9, "python": 0.7, "automatización": 0.8 } },
            { id: '@super-z', name: 'Super Z', type: 'human', skills: { "estrategia": 0.9, "marketing": 0.85, "comunicación": 0.8, "análisis": 0.75 } },
            { id: '@economista-ia', name: 'Economista IA', type: 'ai', provider: 'OpenAI', skills: { "tokenomics": 0.98, "economía": 0.95, "análisis": 0.9, "modelado": 0.85 } },
            { id: '@ia-coder', name: 'IA Coder', type: 'ai', provider: 'OpenAI', skills: { "javascript": 0.98, "python": 0.95, "solidity": 0.85, "react": 0.8 } },
            { id: '@ia-architect', name: 'IA Architect', type: 'ai', provider: 'Anthropic', skills: { "arquitectura": 0.95, "diseño": 0.9, "documentación": 0.85, "seguridad": 0.8 } },
            { id: '@github-integrator', name: 'GitHub Integrator', type: 'ai', provider: 'Custom', skills: { "devops": 0.9, "ci/cd": 0.85, "git": 0.8, "automatización": 0.75 } },
            { id: '@usuario-1', name: 'Ana García', type: 'human', skills: { "frontend": 0.85, "react": 0.8, "ux": 0.75, "css": 0.7 } },
            { id: '@usuario-2', name: 'Carlos López', type: 'human', skills: { "backend": 0.8, "python": 0.75, "bases de datos": 0.7, "api": 0.65 } },
            { id: '@usuario-3', name: 'Marta Ruiz', type: 'human', skills: { "testing": 0.8, "qa": 0.75, "documentación": 0.7, "comunicación": 0.65 } }
        ];

        // FECHAS PARA TRANSACCIONES (desde junio 2025 hasta febrero 2026)
        const startDate = new Date('2025-06-01');
        const endDate = new Date('2026-02-22');
        const dayInMs = 24 * 60 * 60 * 1000;
        
        // Generar 50 transacciones históricas
        this.state.transactions = [];
        
        // Mapeo de roles a proyectos (distribución realista)
        const roleProjectMap = [
            { role: '@enxaneta', project: '#kernel', count: 5 },
            { role: '@enxaneta', project: '#paper', count: 3 },
            { role: '@acotxador', project: '#kernel', count: 4 },
            { role: '@acotxador', project: '#gobernanza', count: 2 },
            { role: '@segon', project: '#kernel', count: 6 },
            { role: '@segon', project: '#tokenomics', count: 3 },
            { role: '@terç', project: '#kernel', count: 8 },
            { role: '@terç', project: '#vna-app', count: 5 },
            { role: '@terç', project: '#frontend', count: 3 },
            { role: '@quart', project: '#vna-app', count: 7 },
            { role: '@quart', project: '#frontend', count: 4 },
            { role: '@pinya', project: '#kernel', count: 10 },
            { role: '@pinya', project: '#vna-app', count: 6 },
            { role: '@cap-de-colles', project: '#kernel', count: 2 },
            { role: '@cap-de-colles', project: '#gobernanza', count: 1 },
            { role: '@aixecador', project: '#paper', count: 3 },
            { role: '@dosos', project: '#kernel', count: 4 },
            { role: '@setens', project: '#tokenomics', count: 5 },
            { role: '@quints', project: '#vna-app', count: 6 },
            { role: '@manilles', project: '#kernel', count: 8 },
            { role: '@manilles', project: '#vna-app', count: 4 },
            { role: '@folre', project: '#frontend', count: 5 },
            { role: '@agulla', project: '#gobernanza', count: 2 },
            { role: '@crossa', project: '#vna-app', count: 4 }
        ];

        let txId = 1;
        roleProjectMap.forEach(item => {
            const userOptions = {
                '@enxaneta': ['@masterproject'],
                '@acotxador': ['@arquitecto', '@ia-architect'],
                '@segon': ['@Mr-Q', '@usuario-2'],
                '@terç': ['@Mr-Q', '@ia-coder', '@usuario-1'],
                '@quart': ['@usuario-1', '@usuario-3'],
                '@pinya': ['@github-integrator', '@usuario-2', '@usuario-3'],
                '@cap-de-colles': ['@masterproject'],
                '@aixecador': ['@arquitecto'],
                '@dosos': ['@arquitecto', '@ia-architect'],
                '@setens': ['@Mr-Q', '@ia-coder'],
                '@quints': ['@usuario-1', '@usuario-2'],
                '@manilles': ['@github-integrator', '@usuario-2'],
                '@folre': ['@ia-coder', '@usuario-1'],
                '@agulla': ['@tester-guardian'],
                '@crossa': ['@usuario-3', '@tester-guardian']
            };

            for (let i = 0; i < item.count; i++) {
                const randomDate = new Date(startDate.getTime() + Math.random() * (endDate - startDate));
                const users = userOptions[item.role] || ['@usuario-1'];
                const user = users[Math.floor(Math.random() * users.length)];
                const uv = Math.floor(Math.random() * 300) + 150; // 150-450 UV
                
                const transactionNames = {
                    '@enxaneta': ['Definición de visión', 'Aprobación de roadmap', 'Decisión estratégica'],
                    '@acotxador': ['Diseño de arquitectura', 'Revisión técnica', 'Documentación de sistema'],
                    '@segon': ['Implementación de API', 'Optimización de base de datos', 'Desarrollo de backend'],
                    '@terç': ['Desarrollo de features', 'Implementación de UI', 'Corrección de bugs'],
                    '@quart': ['Tests unitarios', 'Documentación de código', 'Configuración de entorno'],
                    '@pinya': ['Mantenimiento de servidores', 'CI/CD pipeline', 'Monitoreo'],
                    '@cap-de-colles': ['Planificación estratégica', 'Revisión de OKRs', 'Coordinación de equipo'],
                    '@aixecador': ['Soporte a producción', 'Estabilización de sistema', 'Revisión de calidad'],
                    '@dosos': ['Diseño de soluciones', 'Documentación técnica', 'Especificaciones'],
                    '@setens': ['Revisión de código', 'Mentoría', 'Arquitectura de detalle'],
                    '@quints': ['Desarrollo fullstack', 'Optimización de rendimiento', 'Refactorización'],
                    '@manilles': ['Configuración de infraestructura', 'Automatización', 'Seguridad'],
                    '@folre': ['Integración de servicios', 'Middleware', 'APIs'],
                    '@agulla': ['Auditoría de seguridad', 'Revisión de código', 'Penetration testing'],
                    '@crossa': ['Soporte SRE', 'Resolución de incidentes', 'Backups']
                };

                const nameOptions = transactionNames[item.role] || ['Tarea general'];
                const name = nameOptions[Math.floor(Math.random() * nameOptions.length)];
                
                this.state.transactions.push({
                    id: `tx-hist-${txId++}`,
                    name: `${name} - ${item.project}`,
                    project: item.project,
                    role: item.role,
                    user: user,
                    uv: uv,
                    date: randomDate.toISOString(),
                    description: `Entrega realizada en el contexto del proyecto ${item.project} bajo el rol ${item.role}`
                });
            }
        });

        // Añadir transacciones recientes (últimos 30 días)
        const now = new Date();
        const recentTransactions = [
            { name: 'Implementación de API REST', project: '#kernel', role: '@terç', user: '@Mr-Q', uv: 450 },
            { name: 'Diseño de arquitectura de microservicios', project: '#kernel', role: '@acotxador', user: '@arquitecto', uv: 600 },
            { name: 'Tests unitarios del core', project: '#vna-app', role: '@quart', user: '@usuario-2', uv: 320 },
            { name: 'Smart contract de tokenomics', project: '#paper', role: '@segon', user: '@ia-coder', uv: 780 },
            { name: 'Documentación de API', project: '#kernel', role: '@quart', user: '@usuario-1', uv: 230 },
            { name: 'Revisión de seguridad', project: '#paper', role: '@acotxador', user: '@masterproject', uv: 540 },
            { name: 'Configuración de CI/CD', project: '#vna-app', role: '@pinya', user: '@github-integrator', uv: 180 },
            { name: 'Desarrollo de frontend', project: '#frontend', role: '@terç', user: '@usuario-1', uv: 380 },
            { name: 'Auditoría de seguridad', project: '#gobernanza', role: '@agulla', user: '@tester-guardian', uv: 420 },
            { name: 'Planificación de sprint', project: '#kernel', role: '@cap-de-colles', user: '@masterproject', uv: 290 }
        ];

        recentTransactions.forEach((t, i) => {
            const date = new Date(now.getTime() - (i * 2 * 24 * 60 * 60 * 1000));
            this.state.transactions.push({
                id: `tx-recent-${i+1}`,
                ...t,
                date: date.toISOString(),
                description: t.name
            });
        });

        console.log('✅ Datos históricos cargados:', {
            proyectos: this.state.projects.length,
            roles: this.state.roles.length,
            usuarios: this.state.users.length,
            transacciones: this.state.transactions.length
        });
        
        this.persist();
    }

    // ===== MÉTODOS DE NOTIFICACIÓN =====
    notify() {
        this.listeners.forEach(listener => {
            try {
                listener(this.getState());
            } catch (e) {
                console.error('❌ Error notificando listener:', e);
            }
        });
    }

    isReady() {
        return this.initialized;
    }

    getVersion() {
        return this.state.version;
    }

    resetToMock() {
        this.loadHistoricalData();
        this.notify();
        console.log('🔄 Store resetado a datos históricos');
    }

    exportData() {
        return {
            version: this.state.version,
            exportDate: new Date().toISOString(),
            projects: this.state.projects,
            roles: this.state.roles,
            users: this.state.users,
            transactions: this.state.transactions
        };
    }

    importData(data) {
        try {
            if (!data || !data.version) {
                throw new Error('Formato de datos inválido');
            }
            this.state.projects = data.projects || [];
            this.state.roles = data.roles || [];
            this.state.users = data.users || [];
            this.state.transactions = data.transactions || [];
            this.persist();
            this.notify();
            console.log('📦 Datos importados correctamente');
            return true;
        } catch (e) {
            console.error('❌ Error importando datos:', e);
            return false;
        }
    }
}

export const store = new Store();
window.store = store;
