// /v3/js/core/store.js
// Estado central (SSOT) - v3.5 (Agile Canvas & VNA Ready)

class TTStore {
    constructor() {
        this.state = {
            projects: [],
            roles: [],
            users: [],
            transactions: [] // Registro global de transacciones
        };
        this.initPromise = this.init();
    }

    async init() {
        const saved = localStorage.getItem('teamtowers-v3-state');
        if (saved) {
            try {
                this.state = JSON.parse(saved);
                // Compatibilidad de idioma: asegurar que 'projects' siempre exista
                if (this.state.proyectos && !this.state.projects) {
                    this.state.projects = this.state.proyectos;
                }
                if (!this.state.transactions) this.state.transactions = [];
                if (!this.state.users) this.state.users = this.getDefaultUsers();
                console.log('✅ Estado cargado desde localStorage');
            } catch (e) {
                console.error('Error parsing state', e);
                await this.loadDefaultData();
            }
        } else {
            await this.loadDefaultData();
        }
        
        const bus = window.EventBus || (await import('./event-bus.js').catch(() => ({}))).EventBus;
        if (bus && bus.emit) bus.emit('store-initialized', this.state);
    }

    // ===== MÉTODO DISPATCH (Fix para Tests) =====
    /**
     * Permite que el Store responda a acciones estándar tipo Redux
     * @param {Object} action - { type: string, payload: any }
     */
    dispatch(action) {
        console.log(`Action Dispatched: ${action.type}`, action.payload);
        
        switch (action.type) {
            case 'ADD_PROJECT':
                this.addProject(action.payload);
                break;
            case 'ADD_TRANSACTION':
                this.addTransaction(action.payload.projectId, action.payload.transaction);
                break;
            default:
                console.warn(`Acción no reconocida: ${action.type}`);
        }
    }

    async loadDefaultData() {
        const coreRoles = await this.loadCoreRoles();
        const defaultUsers = this.getDefaultUsers();
        this.state = {
            projects: [],
            roles: coreRoles,
            users: defaultUsers,
            transactions: [],
            config: { version: "3.5-vna-ready" }
        };
        this.saveState();
        console.log('✅ Estado inicializado con datos por defecto');
    }

    async loadCoreRoles() {
        try {
            const response = await fetch('data/core-roles.json');
            if (!response.ok) throw new Error();
            const data = await response.json();
            return data.roles;
        } catch (e) {
            console.warn('Usando roles por defecto (core-roles.json no encontrado)');
            return this.getDefaultRoles();
        }
    }

    getDefaultRoles() {
        return [
            { id: "@arquitecto", nombre: "Master Architect", multiplier: 2.5, color: "#7c2d12" },
            { id: "@developer", nombre: "Dev Segon", multiplier: 1.5, color: "#3b82f6" },
            { id: "@tester", nombre: "Quality Guardian", multiplier: 1.5, color: "#10b981" },
            { id: "@strategist", nombre: "Lead Strategist", multiplier: 2.0, color: "#f59e0b" },
            { id: "@enxaneta.media", nombre: "Visual Storyteller", multiplier: 1.2, color: "#8b5cf6" }
        ];
    }

    getDefaultUsers() {
        return [
            { id: "@alvaro-solache", nombre: "Álvaro Solache", email: "alvaro@teamtowers.com" },
            { id: "@ia-architect", nombre: "IA Architect", email: "ia.architect@teamtowers.com" },
            { id: "@usuario-1", nombre: "Usuario 1", email: "user1@example.com" },
            { id: "@masterproject", nombre: "Master Project", email: "master@teamtowers.com" }
        ];
    }

    getState() {
        // Devolvemos una copia profunda para evitar mutaciones externas
        const stateCopy = JSON.parse(JSON.stringify(this.state));
        // Alias de compatibilidad para tests antiguos
        stateCopy.proyectos = stateCopy.projects;
        return stateCopy;
    }

    addProject(project) {
        if (!project.id) project.id = `p-${Date.now()}`;
        if (!project.roles) project.roles = [];
        
        this.state.projects.push(project);
        this.saveState();
        
        if (window.EventBus) window.EventBus.emit('project-added', project);
    }

    addTransaction(projectId, transaction) {
        const project = this.state.projects.find(p => p.id === projectId);
        if (!project) return false;

        if (!project.transactions) project.transactions = [];
        
        // VNA & Tokenomics v3.5 metadata
        const newTx = {
            id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            projectId,
            tipo_valor: 'tangible',
            status: 'confirmed',
            timestamp: new Date().toISOString(),
            ...transaction
        };

        project.transactions.push(newTx);
        this.state.transactions.push(newTx);

        this.saveState();
        if (window.EventBus) window.EventBus.emit('transaction-added', { projectId, transaction: newTx });
        return true;
    }

    saveState() {
        localStorage.setItem('teamtowers-v3-state', JSON.stringify(this.state));
    }
}

// 1. Instanciamos la clase
const store = new TTStore();

// 2. Fallback Global (Vital para tests y scripts legacy)
window.store = store;

// 3. Exportación ES6
export { store };

console.log('✅ store.js cargado (VNA, Dispatch & Legacy Support Ready)');
