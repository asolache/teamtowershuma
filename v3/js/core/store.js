// store.js - Versión final con todos los datos
const STORE_VERSION = "3.3.0";

class Store {
    constructor() {
        this.state = {
            version: STORE_VERSION,
            projects: [],
            roles: [],
            users: [],
            transactions: [],
            currentPage: 'dashboard'
        };
        this.loadData();
    }

    getState() { return JSON.parse(JSON.stringify(this.state)); }

    loadData() {
        // PROYECTOS
        this.state.projects = [
            { id: '#kernel', name: 'Kernel v4.0', sector: 'software' },
            { id: '#paper', name: 'Paper Tokenomics', sector: 'blockchain' },
            { id: '#vna-app', name: 'VNA App', sector: 'software' },
            { id: '#tokenomics', name: 'Tokenomics System', sector: 'blockchain' },
            { id: '#gobernanza', name: 'Gobernanza DAO', sector: 'blockchain' }
        ];

        // ROLES
        this.state.roles = [
            { id: '@enxaneta', name: 'Enxaneta', level: 'cim', multiplier: 2.5, color: '#f59e0b' },
            { id: '@acotxador', name: 'Acotxador', level: 'tronc', multiplier: 2.0, color: '#8b5cf6' },
            { id: '@segon', name: 'Segon', level: 'tronc', multiplier: 1.5, color: '#3b82f6' },
            { id: '@terç', name: 'Terç', level: 'tronc', multiplier: 1.2, color: '#2563eb' },
            { id: '@quart', name: 'Quart', level: 'tronc', multiplier: 1.0, color: '#10b981' },
            { id: '@pinya', name: 'Pinya', level: 'base', multiplier: 0.8, color: '#64748b' }
        ];

        // USUARIOS
        this.state.users = [
            { id: '@masterproject', name: 'Master Project', type: 'human' },
            { id: '@arquitecto', name: 'Arquitecto IA', type: 'ai' },
            { id: '@Mr-Q', name: 'Mr Q', type: 'ai' },
            { id: '@tester-guardian', name: 'Tester Guardian', type: 'ai' },
            { id: '@usuario-1', name: 'Ana García', type: 'human' }
        ];

        // TRANSACCIONES (30+ para que se vean datos)
        this.state.transactions = [
            // Kernel
            { id: 'tx-001', name: 'Arquitectura modular', project: '#kernel', role: '@acotxador', user: '@arquitecto', uv: 500, date: '2025-01-15' },
            { id: 'tx-002', name: 'Implementar StorageAdapter', project: '#kernel', role: '@terç', user: '@Mr-Q', uv: 450, date: '2025-01-18' },
            { id: 'tx-003', name: 'Tests unitarios core', project: '#kernel', role: '@quart', user: '@tester-guardian', uv: 300, date: '2025-01-22' },
            { id: 'tx-004', name: 'Sistema de eventos', project: '#kernel', role: '@terç', user: '@Mr-Q', uv: 350, date: '2025-01-25' },
            { id: 'tx-005', name: 'Optimización de queries', project: '#kernel', role: '@segon', user: '@arquitecto', uv: 420, date: '2025-02-01' },
            
            // Paper
            { id: 'tx-006', name: 'Ontología de tags', project: '#paper', role: '@acotxador', user: '@arquitecto', uv: 550, date: '2025-02-01' },
            { id: 'tx-007', name: 'Formulario de transacciones', project: '#paper', role: '@terç', user: '@Mr-Q', uv: 400, date: '2025-02-05' },
            { id: 'tx-008', name: 'Sistema estimado vs real', project: '#paper', role: '@terç', user: '@Mr-Q', uv: 380, date: '2025-02-08' },
            { id: 'tx-009', name: 'Gráfico de distribución', project: '#paper', role: '@quart', user: '@usuario-1', uv: 320, date: '2025-02-12' },
            
            // VNA App
            { id: 'tx-010', name: 'Diseño flujo usuario', project: '#vna-app', role: '@quart', user: '@usuario-1', uv: 420, date: '2025-01-20' },
            { id: 'tx-011', name: 'Visualización de grafo', project: '#vna-app', role: '@terç', user: '@Mr-Q', uv: 580, date: '2025-01-25' },
            { id: 'tx-012', name: 'Prototipo alta fidelidad', project: '#vna-app', role: '@quart', user: '@usuario-1', uv: 350, date: '2025-02-01' },
            
            // Tokenomics
            { id: 'tx-013', name: 'Modelo distribución Fibonacci', project: '#tokenomics', role: '@segon', user: '@arquitecto', uv: 700, date: '2025-02-05' },
            { id: 'tx-014', name: 'Smart contract TTH', project: '#tokenomics', role: '@terç', user: '@Mr-Q', uv: 850, date: '2025-02-10' },
            
            // Más transacciones recientes
            { id: 'tx-015', name: 'Revisión de código', project: '#kernel', role: '@acotxador', user: '@arquitecto', uv: 250, date: '2025-02-15' },
            { id: 'tx-016', name: 'Mentoría onboarding', project: '#kernel', role: '@enxaneta', user: '@masterproject', uv: 300, date: '2025-02-16' },
            { id: 'tx-017', name: 'Decisión estratégica', project: '#paper', role: '@enxaneta', user: '@masterproject', uv: 800, date: '2025-02-17' },
            { id: 'tx-018', name: 'Implementación frontend', project: '#vna-app', role: '@quart', user: '@usuario-1', uv: 380, date: '2025-02-18' },
            { id: 'tx-019', name: 'Auditoría de seguridad', project: '#tokenomics', role: '@acotxador', user: '@arquitecto', uv: 500, date: '2025-02-19' },
            { id: 'tx-020', name: 'Configuración CI/CD', project: '#kernel', role: '@pinya', user: '@tester-guardian', uv: 180, date: '2025-02-20' }
        ];
        
        console.log('✅ Store cargado con', this.state.transactions.length, 'transacciones');
    }

    getTransactionsByProject(projectId) {
        return this.state.transactions.filter(t => t.project === projectId);
    }
}

window.store = new Store();
