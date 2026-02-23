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
        // Para tests síncronos, init() puede ser llamado manualmente
        this.initPromise = this.init();
    }

    async init() {
        const saved = localStorage.getItem('teamtowers-v3-state');
        if (saved) {
            try {
                this.state = JSON.parse(saved);
                // Asegurar estructura
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
        
        // Usamos el EventBus global o importado
        const bus = window.EventBus || (await import('./event-bus.js')).EventBus;
        if (bus) bus.emit('store-initialized', this.state);
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
            const data = await response.json();
            return data.roles;
        } catch (e) {
            console.warn('No se pudo cargar core-roles.json, usando array por defecto');
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

    // ===== Métodos de acceso =====
    getState() {
        return JSON.parse(JSON.stringify(this.state));
    }

    // ===== Métodos de modificación de Proyectos y Roles =====
    addProject(project) {
        if (!window.APP_CONSTANTS?.SECTORES_ID && !project.sector) {
            project.sector = 'tecnologia'; // Fallback
        }
        this.state.projects.push(project);
        this.saveState();
        
        if (window.EventBus) window.EventBus.emit('project-added', project);
    }

    updateProject(projectId, updatedProject) {
        const index = this.state.projects.findIndex(p => p.id === projectId);
        if (index !== -1) {
            this.state.projects[index] = updatedProject;
            this.saveState();
            if (window.EventBus) window.EventBus.emit('project-updated', { projectId, project: updatedProject });
            return true;
        }
        return false;
    }

    // NUEVO: Para guardar las coordenadas del Agile Canvas
    updateRoleUIState(projectId, roleId, uiState) {
        const project = this.state.projects.find(p => p.id === projectId);
        if (!project) return false;
        
        const role = project.roles.find(r => r.id === roleId);
        if (!role) return false;

        role.ui_state = { ...role.ui_state, ...uiState }; // Guarda {x, y}
        this.saveState();
        return true;
    }

    updateRoleUsers(projectId, roleId, users) {
        const project = this.state.projects.find(p => p.id === projectId);
        if (!project) return false;
        const role = project.roles.find(r => r.id === roleId);
        if (!role) return false;
        
        role.usuarios_autorizados = users;
        this.saveState();
        if (window.EventBus) window.EventBus.emit('role-users-updated', { projectId, roleId, users });
        return true;
    }

    // ===== MÉTODOS PARA TRANSACCIONES (VNA & Tokenization Ready) =====
    addTransaction(projectId, transaction) {
        const project = this.state.projects.find(p => p.id === projectId);
        if (!project) return false;

        if (!project.transacciones) project.transacciones = [];

        // Inyección Estructural VNA y Tokenomics v3.5
        transaction.projectId = projectId;
        transaction.status = transaction.status || 'draft'; // Soporte para dibujo ágil
        transaction.tipo_valor = transaction.tipo_valor || 'tangible'; // Para líneas continuas/discontinuas
        transaction.tags = transaction.tags || []; // Para Base de Conocimiento (COOPS)
        transaction.hash = transaction.hash || null; // Preparado para Triple-Entry (Blockchain)
        transaction.duration = transaction.duration || 0; // Velocidad de la red
        transaction.wait_time = transaction.wait_time || 0;

        project.transacciones.push(transaction);

        if (!this.state.transactions) this.state.transactions = [];
        this.state.transactions.push(transaction);

        this.saveState();
        if (window.EventBus) window.EventBus.emit('transaction-added', { projectId, transaction });
        return true;
    }

    updateTransaction(projectId, transactionId, updates) {
        const project = this.state.projects.find(p => p.id === projectId);
        if (!project || !project.transacciones) return false;

        const txIndex = project.transacciones.findIndex(tx => tx.id === transactionId);
        if (txIndex === -1) return false;

        Object.assign(project.transacciones[txIndex], updates);

        const globalTx = this.state.transactions.find(tx => tx.id === transactionId);
        if (globalTx) {
            Object.assign(globalTx, updates);
        }

        this.saveState();
        if (window.EventBus) window.EventBus.emit('transaction-updated', { projectId, transactionId, updates });
        return true;
    }

    // ===== UTILIDADES =====
    saveState() {
        localStorage.setItem('teamtowers-v3-state', JSON.stringify(this.state));
    }
}

// 1. Instanciamos
const store = new TTStore();

// 2. Exportación ES6 (¡Esto arregla el test!)
export { store };

// 3. Fallback Global
window.store = store;

console.log('✅ store.js cargado (VNA & ES6 Ready)');
