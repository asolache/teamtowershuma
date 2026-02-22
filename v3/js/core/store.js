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
        // Retornar función para desuscribirse
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    // ===== REDUCER =====
    reducer(state, action) {
        switch(action.type) {
            // Proyectos
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

            // Roles
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

            // Usuarios
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

            // Transacciones
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

            // UI State
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

            // Reset
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
            this.dispatch({
                type: 'ADD_NOTIFICATION',
                payload: {
                    message: 'Error guardando datos',
                    type: 'error'
                }
            });
        }
    }

    hydrate() {
        try {
            const saved = localStorage.getItem('teamtowers-v3');
            if (!saved) {
                console.log('📂 No hay datos guardados, cargando ejemplo...');
                this.loadSampleData();
                return;
            }

            const parsed = JSON.parse(saved);
            
            // Verificar versión y migrar si es necesario
            if (parsed.version && parsed.version !== STORE_VERSION) {
                console.log(`🔄 Migrando de versión ${parsed.version} a ${STORE_VERSION}`);
                const migrator = this.migrations[parsed.version];
                if (migrator) {
                    const migrated = migrator(parsed);
                    this.state = { ...this.state, ...migrated };
                    console.log('✅ Migración completada');
                } else {
                    console.warn(`⚠️ Versión ${parsed.version} no migrable, usando datos por defecto`);
                    this.loadSampleData();
                }
            } else {
                // Versión correcta, cargar datos
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
            this.loadSampleData();
        }
    }

    // ===== MIGRACIONES =====
    migrateFromV2(oldState) {
        console.log('Migrando desde v2...');
        return {
            projects: (oldState.projects || []).map(p => ({ 
                ...p, 
                sector: p.sector || 'software',
                createdAt: p.createdAt || new Date().toISOString()
            })),
            roles: (oldState.roles || []).map(r => ({
                ...r,
                level: r.level || 'quart',
                skills: r.skills || []
            })),
            users: (oldState.users || []).map(u => ({
                ...u,
                type: u.type || 'human',
                skills: u.skills || {}
            })),
            transactions: oldState.transactions || []
        };
    }

    migrateFromV3(oldState) {
        console.log('Migrando desde v3.0...');
        return {
            ...oldState,
            users: (oldState.users || []).map(u => ({
                ...u,
                skills: u.skills || {}
            }))
        };
    }

    migrateFromV31(oldState) {
        console.log('Migrando desde v3.1...');
        return {
            ...oldState,
            ui: {
                loading: false,
                error: null,
                notifications: []
            }
        };
    }

    migrateFromV32(oldState) {
        console.log('Migrando desde v3.2...');
        return {
            ...oldState,
            roles: (oldState.roles || []).map(r => ({
                ...r,
                skills: r.skills || []
            }))
        };
    }

    // ===== DATOS DE EJEMPLO =====
    loadSampleData() {
        console.log('📊 Cargando datos de ejemplo...');
        
        this.state.projects = [
            { 
                id: '#kernel', 
                name: 'Kernel v4', 
                sector: 'software',
                description: 'Núcleo del sistema de tokenomics',
                createdAt: '2026-01-15T10:00:00Z'
            },
            { 
                id: '#paper', 
                name: 'Paper Tokenomics', 
                sector: 'blockchain',
                description: 'Sistema de contabilidad de valor',
                createdAt: '2026-01-20T10:00:00Z'
            },
            { 
                id: '#vna-app', 
                name: 'VNA App', 
                sector: 'software',
                description: 'Aplicación de Value Network Analysis',
                createdAt: '2026-02-01T10:00:00Z'
            },
            { 
                id: '#tokenomics', 
                name: 'Tokenomics Engine', 
                sector: 'blockchain',
                description: 'Motor de economía tokenizada',
                createdAt: '2026-02-10T10:00:00Z'
            }
        ];

        this.state.roles = [
            { 
                id: '@enxaneta', 
                name: 'Enxaneta', 
                level: 'cim',
                description: 'Visión y logro final',
                multiplier: 2.5, 
                color: '#f59e0b',
                skills: ['visión', 'liderazgo', 'equilibrio']
            },
            { 
                id: '@acotxador', 
                name: 'Acotxador', 
                level: 'tronc',
                description: 'Arquitectura y soporte',
                multiplier: 2.0, 
                color: '#8b5cf6',
                skills: ['arquitectura', 'diseño', 'estabilidad']
            },
            { 
                id: '@segon', 
                name: 'Segon', 
                level: 'tronc',
                description: 'Implementación avanzada',
                multiplier: 1.5, 
                color: '#3b82f6',
                skills: ['backend', 'api', 'bases de datos']
            },
            { 
                id: '@terç', 
                name: 'Terç', 
                level: 'tronc',
                description: 'Desarrollo principal',
                multiplier: 1.2, 
                color: '#2563eb',
                skills: ['desarrollo', 'implementación', 'tests']
            },
            { 
                id: '@quart', 
                name: 'Quart', 
                level: 'tronc',
                description: 'Desarrollo junior',
                multiplier: 1.0, 
                color: '#10b981',
                skills: ['frontend', 'componentes', 'colaboración']
            },
            { 
                id: '@pinya', 
                name: 'Pinya', 
                level: 'base',
                description: 'Soporte e infraestructura',
                multiplier: 0.8, 
                color: '#64748b',
                skills: ['soporte', 'devops', 'mantenimiento']
            }
        ];

        this.state.users = [
            { 
                id: '@masterproject', 
                name: 'Master Project', 
                type: 'human',
                skills: { "visión": 0.95, "liderazgo": 0.9, "estratègia": 0.85 }
            },
            { 
                id: '@usuario-1', 
                name: 'Ana García', 
                type: 'human',
                skills: { "desarrollo": 0.85, "javascript": 0.8, "react": 0.75 }
            },
            { 
                id: '@usuario-2', 
                name: 'Carlos López', 
                type: 'human',
                skills: { "testing": 0.9, "qa": 0.85, "python": 0.7 }
            },
            { 
                id: '@ia-coder', 
                name: 'IA Coder', 
                type: 'ai', 
                provider: 'OpenAI',
                skills: { "javascript": 0.98, "python": 0.95, "solidity": 0.85 }
            }
        ];

        // Fechas para las transacciones (últimos 15 días)
        const now = new Date();
        this.state.transactions = [
            {
                id: 'tx-1',
                name: 'Implementar API REST',
                project: '#kernel',
                role: '@terç',
                user: '@usuario-1',
                uv: 450,
                date: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
                description: 'Implementación de endpoints REST para el módulo de autenticación'
            },
            {
                id: 'tx-2',
                name: 'Diseñar arquitectura de microservicios',
                project: '#kernel',
                role: '@acotxador',
                user: '@masterproject',
                uv: 600,
                date: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString(),
                description: 'Diseño de la arquitectura base del sistema'
            },
            {
                id: 'tx-3',
                name: 'Tests unitarios del core',
                project: '#vna-app',
                role: '@quart',
                user: '@usuario-2',
                uv: 320,
                date: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
                description: 'Suite de tests para el motor de valor'
            },
            {
                id: 'tx-4',
                name: 'Smart contract de tokenomics',
                project: '#paper',
                role: '@segon',
                user: '@ia-coder',
                uv: 780,
                date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                description: 'Implementación del contrato ERC20 con lógica de tokenomics'
            },
            {
                id: 'tx-5',
                name: 'Documentación de API',
                project: '#kernel',
                role: '@quart',
                user: '@usuario-1',
                uv: 230,
                date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                description: 'Documentación Swagger/OpenAPI'
            },
            {
                id: 'tx-6',
                name: 'Revisión de seguridad',
                project: '#paper',
                role: '@acotxador',
                user: '@masterproject',
                uv: 540,
                realValue: 520,
                date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                description: 'Auditoría de seguridad del smart contract'
            },
            {
                id: 'tx-7',
                name: 'Configuración de CI/CD',
                project: '#vna-app',
                role: '@pinya',
                user: '@usuario-2',
                uv: 180,
                date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                description: 'Pipeline de integración continua'
            }
        ];
        
        this.persist();
        console.log('✅ Datos de ejemplo cargados:', {
            proyectos: this.state.projects.length,
            roles: this.state.roles.length,
            usuarios: this.state.users.length,
            transacciones: this.state.transactions.length
        });
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

    // ===== MÉTODOS DE UTILIDAD =====
    
    // Verificar si está listo
    isReady() {
        return this.initialized;
    }

    // Obtener versión
    getVersion() {
        return this.state.version;
    }

    // Resetear a estado inicial (útil para tests)
    resetToMock() {
        this.loadSampleData();
        this.notify();
        console.log('🔄 Store resetado a datos de ejemplo');
    }

    // Exportar datos completos
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

    // Importar datos (con validación)
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

// Crear instancia única (singleton)
export const store = new Store();

// Hacer disponible globalmente (para debugging y tests)
window.store = store;